import { createAdminClient } from '@/lib/server/supabase-admin';
import { auth } from '@/auth';

export interface UserProfile {
    id: string;
    email: string;
    prenom?: string;
    nom?: string;
    pseudo?: string;
    avatar_url?: string;
}

export interface Bank {
    id: string;
    provider_name: string;
    status: string;
    created_at: string;
}

export async function getProfile(): Promise<UserProfile | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

export async function updateProfile(data: {
    prenom?: string;
    nom?: string;
    pseudo?: string;
    avatar_url?: string;
}): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('users').update(data).eq('id', session.user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getBanks(): Promise<Bank[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('truelayer_tokens').select('*').eq('user_id', session.user.id);

    if (error) {
        console.error('Error fetching banks:', error);
        return [];
    }

    return data || [];
}

export async function deleteBank(id: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('truelayer_tokens').delete().eq('id', id).eq('user_id', session.user.id);

    if (error) {
        console.error('Error deleting bank:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('id', session.user.id);

    if (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
