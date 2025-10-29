'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name || !email || !password) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        setSuccess(true);

        setTimeout(() => router.push('/'), 1500);

        setLoading(false);
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-6 overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="animate-spin text-[#38B2AC] w-10 h-10" />
                        <p className="text-gray-700 font-medium animate-pulse">
                            Criando conta...
                        </p>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleRegister}
                className={`w-full max-w-lg p-12 md:p-20 space-y-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-300/50 shadow-md transition-all duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'
                    }`}
            >
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="flex items-center text-[#38B2AC] hover:text-[#2C7A7B] transition-colors mb-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Voltar ao login
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
                        Ministério<span className="text-[#38B2AC]">360</span>
                    </h1>
                    <p className="text-gray-600 text-base mt-3">
                        Crie sua conta para começar
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Nome da igreja
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:border-transparent placeholder-gray-400 bg-white/90"
                            placeholder="Digite o nome da igreja"
                            required
                        />
                    </div>

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
                            placeholder="Crie uma senha"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Confirmar senha
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC] focus:border-transparent placeholder-gray-400 bg-white/90"
                            placeholder="Confirme sua senha"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-base text-red-500 text-center font-medium mt-2">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="text-base text-green-600 text-center font-medium mt-2">
                        Conta criada com sucesso! Redirecionando...
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 text-white py-4 text-lg rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 shadow-sm ${loading
                        ? 'bg-linear-to-r from-[#38B2AC] to-[#319795] animate-pulse'
                        : 'bg-[#38B2AC] hover:bg-[#319795]'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-6 w-6" />
                            Criando...
                        </>
                    ) : (
                        'Criar conta'
                    )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-10">
                    © {new Date().getFullYear()} Ministério360
                </p>
            </form>
        </div>
    );
}
