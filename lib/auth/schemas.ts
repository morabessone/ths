import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Ingresá tu nombre'),
});

export const biometricsSchema = z.object({
  weight_kg: z.number().min(30).max(300),
  height_cm: z.number().min(100).max(250),
  age: z.number().min(14).max(100),
  biological_sex: z.enum(['male', 'female']),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type BiometricsForm = z.infer<typeof biometricsSchema>;
