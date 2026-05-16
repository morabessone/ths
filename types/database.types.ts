export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'free' | 'premium' | 'nutritionist' | 'admin';
          onboarding_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          email: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'free' | 'premium' | 'nutritionist' | 'admin';
          onboarding_done?: boolean;
          updated_at?: string;
        };
      };
      biometrics: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number | null;
          height_cm: number | null;
          age: number | null;
          biological_sex: 'male' | 'female' | null;
          goal: string | null;
          activity_level: string | null;
          training_days: number | null;
          training_type: string | null;
          training_time: string | null;
          dietary_style: string | null;
          intolerances: string[] | null;
          health_conditions: string[] | null;
          current_supplements: string[] | null;
          recorded_at: string;
        };
        Insert: {
          user_id: string;
          weight_kg?: number | null;
          height_cm?: number | null;
          age?: number | null;
          biological_sex?: 'male' | 'female' | null;
          goal?: string | null;
          activity_level?: string | null;
          training_days?: number | null;
          training_type?: string | null;
          training_time?: string | null;
          dietary_style?: string | null;
          intolerances?: string[] | null;
          health_conditions?: string[] | null;
          current_supplements?: string[] | null;
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['biometrics']['Insert']>;
      };
      daily_plan: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          breakfast: Json | null;
          lunch: Json | null;
          snack: Json | null;
          dinner: Json | null;
          supplements: Json | null;
          education_tip: Json | null;
          wearable_context: Json | null;
          generated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['daily_plan']['Row']> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['daily_plan']['Insert']>;
      };
      nutrient_targets: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories_kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          vit_d_mcg: number | null;
          vit_b12_mcg: number | null;
          vit_c_mg: number | null;
          vit_a_mcg: number | null;
          folate_mcg: number | null;
          iron_mg: number | null;
          calcium_mg: number | null;
          magnesium_mg: number | null;
          zinc_mg: number | null;
          potassium_mg: number | null;
          sodium_mg: number | null;
          omega3_g: number | null;
          water_ml: number | null;
          day_type: string | null;
          training_focus: string | null;
        };
        Insert: Partial<Database['public']['Tables']['nutrient_targets']['Row']> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['nutrient_targets']['Insert']>;
      };
      fridge_stock: {
        Row: {
          id: string;
          user_id: string;
          ingredient_id: string | null;
          ingredient_name: string;
          quantity: number | null;
          unit: string | null;
          added_at: string | null;
          expires_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['fridge_stock']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['fridge_stock']['Insert']>;
      };
      wearable_data: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          source: string | null;
          steps: number | null;
          calories_burned: number | null;
          active_minutes: number | null;
          training_detected: boolean | null;
          training_type: string | null;
          sleep_hours: number | null;
          sleep_quality: string | null;
          synced_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['wearable_data']['Row']> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['wearable_data']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_sub_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          user_id: string;
          plan: string;
          status: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Biometrics = Database['public']['Tables']['biometrics']['Row'];
export type DailyPlan = Database['public']['Tables']['daily_plan']['Row'];
export type NutrientTargetsRow = Database['public']['Tables']['nutrient_targets']['Row'];
export type FridgeStockItem = Database['public']['Tables']['fridge_stock']['Row'];
export type WearableData = Database['public']['Tables']['wearable_data']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
