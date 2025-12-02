import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 🚨 Permite reset de senha SEM verificação de sessão
  if (
    url.pathname.startsWith('/reset-password') ||
    url.pathname.startsWith('/auth/callback')
  ) {
    return NextResponse.next();
  }

  // Inicializa o Supabase Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Captura o token de sessão do cookie
  const token = req.cookies.get('sb-access-token')?.value;

  // Se não houver token e o caminho for protegido → redireciona para login
  if (
    !token &&
    !url.pathname.startsWith('/login') &&
    !url.pathname.startsWith('/register')
  ) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se houver token, tenta decodificar para garantir validade
  if (token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.delete('sb-access-token');
        res.cookies.delete('sb-refresh-token');
        return res;
      }

      // Bloqueia acesso a /login e /register se já estiver logado
      if (
        (url.pathname.startsWith('/login') ||
          url.pathname.startsWith('/register')) &&
        data.user
      ) {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Erro ao validar sessão:', err);
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('sb-access-token');
      res.cookies.delete('sb-refresh-token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/financas/:path*',
    '/membros/:path*',
    '/visitantes/:path*',
    '/eventos/:path*',
  ],
};
