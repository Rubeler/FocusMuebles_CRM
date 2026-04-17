"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, currentUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/crm");
      }
    }
  }, [isAuthenticated, currentUser, router, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 300));

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Error al iniciar sesión");
    }
    setSubmitting(false);
  };

  // Don't render form while auth state is loading
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-tech-blue/15 blur-[120px]" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-tech-blue/15 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-green-benetton/10 blur-[100px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-violet text-4xl shadow-lg glow-violet">
            🪑
          </div>
          <h1 className="text-3xl font-extrabold text-gradient-violet">
            FocusMuebles
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Login form */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <span className="text-sm font-medium text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-violet py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 glass rounded-2xl p-5">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Credenciales de demo
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@focusmuebles.com");
                setPassword("admin123");
                setError("");
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-violet/20 bg-violet/5 px-4 py-3 text-left transition-all hover:border-violet/40 hover:bg-violet/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/20">
                <span className="text-sm">👑</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-violet-light">Admin</p>
                <p className="text-xs text-zinc-500">
                  admin@focusmuebles.com / admin123
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} FocusMuebles. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
