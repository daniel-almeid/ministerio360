'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simula autenticação (aceita qualquer e-mail/senha)
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (email && password) {
            router.push('/dashboard');
        } else {
            setError('Informe e-mail e senha.');
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-6">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-lg p-12 md:p-20 space-y-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-300/50 shadow-md"
            >
                {/* Logo / Título */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
                        Ministério<span className="text-[#38B2AC]">360</span>
                    </h1>
                    <p className="text-gray-600 text-base mt-3">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* Campos */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:border-transparent placeholder-gray-400 bg-white/90"
                            placeholder="Digite seu e-mail"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:border-transparent placeholder-gray-400 bg-white/90"
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-base text-red-500 text-center font-medium mt-2">
                        {error}
                    </p>
                )}

                {/* Botão */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#38B2AC] hover:bg-[#319795] text-white py-4 text-lg rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 shadow-sm"
                >
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Entrar'}
                </button>

                {/* Recuperação */}
                <div className="text-center mt-6">
                    <button
                        type="button"
                        className="text-base text-[#38B2AC] hover:text-[#2C7A7B] transition-colors"
                        onClick={() => alert('Função de recuperação de senha em breve.')}
                    >
                        Esqueceu sua senha?
                    </button>
                </div>

                {/* Rodapé */}
                <p className="text-center text-sm text-gray-500 mt-10">
                    © {new Date().getFullYear()} Ministério360
                </p>
            </form>
        </div>
    );
}
