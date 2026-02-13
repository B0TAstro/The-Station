import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
    prenom: z.string().min(2, 'Prénom trop court'),
    nom: z.string().min(2, 'Nom trop court'),
    pseudo: z.string().min(3, 'Pseudo trop court (min 3 car.)'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
