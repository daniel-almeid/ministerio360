'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useAuthGuard() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) router.replace('/auth/login');
        });
    }, [router]);
}
