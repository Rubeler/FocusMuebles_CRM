"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
} from "lucide-react";
import {
  getWorkshopName,
  saveWorkshopName,
  getWorkshopLogo,
  saveWorkshopLogo,
} from "@/lib/store";

export default function CRMConfig() {
  const [workshopName, setWorkshopName] = useState("");
  const [workshopLogo, setWorkshopLogo] = useState("");
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [name, logo] = await Promise.all([
          getWorkshopName(),
          getWorkshopLogo(),
        ]);
        setWorkshopName(name);
        setWorkshopLogo(logo);
      } catch {
        // fallback values already set
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await saveWorkshopName(tempName.trim());
      setWorkshopName(tempName.trim());
      setEditName(false);
      flashSaved();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen (PNG, JPG, SVG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no puede superar los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await saveWorkshopLogo(base64);
      setWorkshopLogo(base64);
      flashSaved();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    await saveWorkshopLogo("");
    setWorkshopLogo("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Configuración
        </h1>
        <p className="text-zinc-400">
          Personaliza tu experiencia en FocusMuebles
        </p>
      </div>

      {/* Save confirmation toast */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
          <Check size={18} className="text-green-400" />
          <span className="text-sm font-medium text-green-300">
            Cambios guardados correctamente
          </span>
        </div>
      )}

      {/* ─── Datos del Taller ─── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Datos del Taller
        </h3>
        <div className="space-y-4">
          {/* Nombre del taller */}
          <div className="rounded-xl border border-white/5 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  Nombre del taller
                </p>
                {editName ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="flex-1 rounded-lg border border-violet-500/40 bg-black/30 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
                      placeholder="Ej: Muebles de Buena Madera"
                      autoFocus
                    />
                    <Button
                      onClick={handleSaveName}
                      size="sm"
                      className="bg-violet-600 text-white hover:bg-violet-500 shrink-0"
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      onClick={() => setEditName(false)}
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 shrink-0"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-violet-400 font-medium truncate">
                    {workshopName}
                  </p>
                )}
              </div>
              {!editName && (
                <Button
                  onClick={() => {
                    setTempName(workshopName);
                    setEditName(true);
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white shrink-0 ml-3"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Logo del negocio */}
          <div className="rounded-xl border border-white/5 bg-white/3 p-4">
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/10 overflow-hidden">
                {workshopLogo ? (
                  <img
                    src={workshopLogo}
                    alt="Logo"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-600">
                    <ImageIcon size={24} />
                    <span className="mt-1 text-[10px]">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  Logo del negocio
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  PNG, JPG o SVG. Máximo 2MB.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    className="bg-violet-600 text-white hover:bg-violet-500"
                  >
                    <Upload size={14} className="mr-1" />
                    Subir logo
                  </Button>
                  {workshopLogo && (
                    <Button
                      onClick={handleRemoveLogo}
                      size="sm"
                      variant="ghost"
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Preferencias ─── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Preferencias
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-4">
            <div>
              <p className="text-sm font-medium text-white">Moneda</p>
              <p className="text-xs text-zinc-500">MXN (Peso Mexicano)</p>
            </div>
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400">
              Próximamente
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-4">
            <div>
              <p className="text-sm font-medium text-white">Notificaciones</p>
              <p className="text-xs text-zinc-500">
                Recordatorios de llamadas y entregas
              </p>
            </div>
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400">
              Próximamente
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-4">
            <div>
              <p className="text-sm font-medium text-white">Exportar datos</p>
              <p className="text-xs text-zinc-500">
                Descarga tus leads y clientes en CSV
              </p>
            </div>
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400">
              Próximamente
            </span>
          </div>
        </div>
      </div>

      {/* ─── Acerca de ─── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Acerca de</h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <p>
            FocusMuebles v1.0.0
          </p>
          <p>Hecho por muebleros, para muebleros.</p>
          <p>
            © {new Date().getFullYear()} FocusMuebles. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
