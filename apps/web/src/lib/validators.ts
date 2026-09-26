import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// min(8) aligné sur RegisterEmailDto côté backend (apps/api/src/auth/dto/register-email.dto.ts)
export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est trop court'),
  lastName: z.string().min(2, 'Le nom est trop court'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const employeeSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(8, 'Le numéro de téléphone est invalide'),
  email: z.union([z.literal(''), z.string().email('Adresse e-mail invalide')]).optional(),
  role: z.enum(['TENANT_EMPLOYEE', 'TENANT_ADMIN']),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
