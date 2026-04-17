"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Trash2,
  LogOut,
  Crown,
} from "lucide-react";

export default function AdminPage() {
  const { currentUser, users, register, deleteUser, logout, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect non-authenticated users and non-admin users
  useEffect(() => {
    if (loading) return;
    if (currentUser === null) return; // Still loading session
    if (currentUser.role !== "admin") {
      router.push("/crm");
    }
  }, [currentUser, router, loading]);

  // Loading state while session is being restored
  if (loading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    );
  }

  // Don't render admin UI for non-admin users
  if (currentUser.role !== "admin") {
    return null;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const result = await register({ name, email, password });
    if (result.success) {
      setName("");
      setEmail("");
      setPassword("");
      setSuccess("Usuario creado exitosamente");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Error al crear usuario");
    }
    setSubmitting(false);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      await deleteUser(userId);
    }
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-[#0a0a0a] px-4 py-8 sm:py-12 overflow-auto">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-tech-blue/15 blur-[120px]" />

      <div className="relative w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-violet text-3xl shadow-lg glow-violet">
            👑
          </div>
          <h1 className="text-3xl font-extrabold text-gradient-violet">
            Panel de Administración
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gestiona usuarios y configuración del sistema
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <Users size={20} className="mx-auto mb-2 text-violet" />
            <div className="text-2xl font-extrabold text-white">{users.length}</div>
            <div className="text-xs text-zinc-500">Total Usuarios</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <UserPlus size={20} className="mx-auto mb-2 text-tech-blue" />
            <div className="text-2xl font-extrabold text-white">{userCount}</div>
            <div className="text-xs text-zinc-500">Cuentas</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Crown size={20} className="mx-auto mb-2 text-amber-400" />
            <div className="text-2xl font-extrabold text-white">{adminCount}</div>
            <div className="text-xs text-zinc-500">Admins</div>
          </div>
        </div>

        {/* Create user form */}
        <div className="glass-strong mb-6 rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <UserPlus size={20} className="text-violet" />
            Nuevo Usuario
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Contraseña</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                minLength={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-violet/50 focus:ring-1 focus:ring-violet/30"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <span className="text-sm font-medium text-red-400">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                <span className="text-sm font-medium text-green-300">{success}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-violet text-white hover:opacity-90 disabled:opacity-50"
            >
              <UserPlus size={16} className="mr-2" />
              {submitting ? "Creando..." : "Crear Usuario"}
            </Button>
          </form>
        </div>

        {/* Users list */}
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck size={20} className="text-violet" />
            Usuarios Registrados
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No hay usuarios registrados
              </p>
            ) : (
              users.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-4 transition-colors hover:bg-white/5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      user.role === "admin"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-tech-blue/20 text-tech-blue"
                    }`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name}
                      </p>
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          <Crown size={10} />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      {user.email} · Creado: {user.createdAt}
                    </p>
                  </div>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/crm")}
            className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Ir al CRM
          </Button>
          <Button
            variant="outline"
            onClick={logout}
            className="flex-1 border-white/20 bg-white/5 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
          >
            <LogOut size={16} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} FocusMuebles. Panel de administración.
        </p>
      </div>
    </div>
  );
}
