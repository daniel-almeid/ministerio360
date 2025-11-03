// app/debug/page.tsx
'use client';

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DebugPage() {
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Sessão atual:', data);
      console.log('App metadata:', data.session?.user?.app_metadata);
    })();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-xl font-semibold text-gray-700">
        Página de Debug
      </h1>
      <p className="text-gray-500 mt-3">
        Veja o console (F12) para verificar se o church_id está presente no token.
      </p>
    </div>
  );
}
