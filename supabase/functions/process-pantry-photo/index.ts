import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callClaude } from '../_shared/anthropic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `
Sos un asistente que identifica alimentos y productos de una imagen.
Devolvé ÚNICAMENTE un JSON válido con esta estructura, sin texto adicional:
{
  "type": "pantry_photo" | "receipt",
  "items": [
    {
      "name": "Nombre del producto en español",
      "category": "protein|vegetable|fruit|grain|dairy|fat|legume|supplement|condiment|frozen|canned|spice|other",
      "quantity": "descripción libre",
      "location": "fridge|freezer|pantry"
    }
  ],
  "confidence": "high|medium|low"
}
Solo incluir items claramente identificables. No inventar items.
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, image_base64, media_type = 'image/jpeg', source_type = 'pantry_photo' } =
      await req.json();

    const raw = await callClaude({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type, data: image_base64 },
            },
            {
              type: 'text',
              text:
                source_type === 'receipt'
                  ? 'Esta es una foto de ticket de supermercado. Extraé los productos.'
                  : 'Esta es una foto de heladera o alacena. Identificá los alimentos visibles.',
            },
          ],
        },
      ],
      maxTokens: 1500,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { items: [], type: source_type };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const addedVia = source_type === 'receipt' ? 'receipt' : 'photo';
    const rows = (parsed.items ?? []).map(
      (item: {
        name: string;
        category: string;
        quantity?: string;
        location?: string;
      }) => ({
        user_id,
        name: item.name,
        category: item.category ?? 'other',
        quantity: item.quantity ?? null,
        location: item.location ?? 'pantry',
        added_via: addedVia,
      })
    );

    if (rows.length > 0) {
      await supabase.from('pantry_items').insert(rows);
    }

    return new Response(JSON.stringify({ items: rows, confidence: parsed.confidence }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
