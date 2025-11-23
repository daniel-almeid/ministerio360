"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [plan, setPlan] = useState("free");
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          church_name: name,
          plan_slug: plan,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signUpError) {
      setError("Erro ao criar conta: " + signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);

    if (plan === "free") {
      setTimeout(() => {
        router.push("/login");
      }, 1800);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: plan, email }),
      });

      const result = await res.json();

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }

      setError("Erro ao iniciar pagamento.");
    } catch {
      setError("Erro ao gerar link de pagamento.");
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200 px-6 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin text-teal-500 w-10 h-10" />
            <p className="text-gray-700 font-medium">Criando conta...</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleRegister}
        className={`w-full max-w-5xl p-12 md:p-20 space-y-12 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-300/50 shadow-xl transition-all ${
          loading ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Voltar ao login
        </button>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
            Ministério<span className="text-teal-500">360</span>
          </h1>
          <p className="text-gray-600 text-base mt-3">Crie sua conta para começar</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Nome da igreja</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-teal-500"
              placeholder="Exemplo: Igreja Vida Nova"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Esse é o nome que aparecerá no sistema.</p>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-teal-500"
              placeholder="seuemail@exemplo.com"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Usado para login e recuperação de senha.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <label className="block text-base font-semibold text-gray-700 mb-2">Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 pr-12"
                placeholder="Crie uma senha forte"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-12 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-base font-semibold text-gray-700 mb-2">Confirmar senha</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 text-lg border rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 pr-12"
                placeholder="Repita sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-12 text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-300 my-10"></div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-3">Plano</label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["free", "standard", "premium"].map((p) => (
              <div
                key={p}
                className={`rounded-2xl border p-6 flex flex-col justify-between shadow-md transition ${
                  plan === p ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
                }`}
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {p === "free" ? "Free" : p === "standard" ? "Standard" : "Premium"}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {p === "free"
                      ? "Recursos básicos"
                      : p === "standard"
                      ? "Funcionalidades avançadas"
                      : "Acesso completo"}
                  </p>

                  <p className="text-3xl font-extrabold text-gray-800 mb-4">
                    {p === "free" ? "R$ 0" : p === "standard" ? "R$ 49,90" : "R$ 99,90"}
                    <span className="text-base font-medium">/mês</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`w-full py-2 rounded-xl font-semibold ${
                      plan === p ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Selecionar
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDetails(p)}
                    className="w-full py-2 rounded-xl border border-gray-400 text-gray-700 text-sm"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-base text-red-500 text-center">{error}</p>}

        {success && (
          <p className="text-base text-green-600 text-center">
            Conta criada com sucesso. Verifique seu e-mail para confirmar.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 text-white py-4 text-lg rounded-xl font-semibold transition shadow-sm ${
            loading ? "bg-linear-to-r from-teal-500 to-teal-400 animate-pulse" : "bg-teal-500 hover:bg-teal-600"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-6 w-6" />
              Criando...
            </>
          ) : (
            "Criar conta"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Ministério360
        </p>
      </form>

      {showDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Detalhes do plano {showDetails === "free" ? "Free" : showDetails === "standard" ? "Standard" : "Premium"}
            </h2>

            {showDetails === "free" && (
              <ul className="space-y-2 text-gray-700">
                <li>• Dashboard</li>
                <li>• Controle financeiro</li>
                <li>• Cadastro de membros</li>
              </ul>
            )}

            {showDetails === "standard" && (
              <ul className="space-y-2 text-gray-700">
                <li>• Tudo do plano Free e mais um pouco</li>
                <li>• Cadastro de visitantes</li>
                <li>• Acompanhamento de visitantes</li>
                <li>• Relatórios</li>
              </ul>
            )}

            {showDetails === "premium" && (
              <ul className="space-y-2 text-gray-700">
                <li>• Tudo do plano Standard</li>
                <li>• Cadastro de ministérios</li>
                <li>• Tela de eventos e escalas</li>
                <li>• Suporte prioritário</li>
              </ul>
            )}

            <button
              onClick={() => setShowDetails(null)}
              className="w-full mt-4 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
