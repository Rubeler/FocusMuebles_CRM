"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserPlus,
  MessageSquare,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface ContactSubmission {
  id: string;
  full_name: string;
  whatsapp: string;
  instagram: string;
  email: string;
  monthly_leads: string;
  message: string;
  status: string;
  notes: string;
  submitted_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  nuevo: { label: "Nuevo", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: Clock },
  contactado: { label: "Contactado", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: MessageSquare },
  calificado: { label: "Calificado", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle },
  descartado: { label: "Descartado", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle },
};

export default function InteresadosPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const client = getSupabaseClient();

      if (client) {
        const { data, error } = await client
          .from("contact_submissions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching from Supabase:", error);
          setSubmissions([]);
        } else {
          setSubmissions(data || []);
        }
      } else {
        // Fallback: read from localStorage
        setUsingLocalStorage(true);
        const localData = localStorage.getItem("focusmuebles_contacts");
        if (localData) {
          const parsed = JSON.parse(localData);
          const mapped = parsed.map((item: any) => ({
            id: item.id,
            full_name: item.fullName,
            whatsapp: item.whatsapp,
            instagram: item.instagram,
            email: item.email,
            monthly_leads: item.monthlyLeads,
            message: item.message,
            status: "nuevo",
            notes: "",
            submitted_at: item.submittedAt,
            updated_at: item.submittedAt,
          }));
          setSubmissions(mapped);
        }
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSaveStatus = async () => {
    if (!selectedItem || !editingStatus) return;
    setSaving(true);
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client
          .from("contact_submissions")
          .update({
            status: editingStatus,
            notes: editingNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedItem.id);

        if (error) throw error;
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedItem.id
            ? { ...s, status: editingStatus, notes: editingNotes }
            : s
        )
      );
      toast.success("Estado actualizado");
      setSelectedItem(null);
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (item: ContactSubmission) => {
    setSelectedItem(item);
    setEditingNotes(item.notes || "");
    setEditingStatus(item.status);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.whatsapp || "").includes(searchTerm);
    const matchesStatus = filterStatus === "todos" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const newCount = submissions.filter((s) => s.status === "nuevo").length;
  const totalCount = submissions.length;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWhatsAppUrl = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Nuevos Interesados
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Personas que llenaron el formulario desde la landing page
          </p>
        </div>
        <div className="flex gap-2">
          {newCount > 0 && (
            <Badge className="bg-violet/20 text-violet-light border border-violet/30 px-3 py-1.5 text-sm">
              {newCount} nuevo{newCount !== 1 && "s"}
            </Badge>
          )}
          <Badge className="bg-white/10 text-zinc-300 border border-white/10 px-3 py-1.5 text-sm">
            {totalCount} total
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubmissions}
            disabled={loading}
            className="border-white/10 text-zinc-300 hover:bg-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {usingLocalStorage && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Usando datos locales. Conecta Supabase para ver los datos en tiempo real.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Buscar por nombre, email o WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-500"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 text-white sm:w-44">
            <Filter size={14} className="mr-2 text-zinc-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-zinc-900">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="contactado">Contactado</SelectItem>
            <SelectItem value="calificado">Calificado</SelectItem>
            <SelectItem value="descartado">Descartado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserPlus size={48} className="mb-4 text-zinc-600" />
            <h3 className="mb-2 text-lg font-medium text-zinc-400">
              {submissions.length === 0
                ? "Aun no hay interesados"
                : "No se encontraron resultados"}
            </h3>
            <p className="text-sm text-zinc-500">
              {submissions.length === 0
                ? "Las solicitudes de contacto apareceraan aqui cuando alguien llene el formulario de la landing."
                : "Intenta con otros filtros o terminos de busqueda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.nuevo;
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={item.id}
                className="cursor-pointer border-white/5 bg-white/[0.02] transition-all hover:border-white/10 hover:bg-white/[0.04]"
                onClick={() => openDetail(item)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-white">
                          {item.full_name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`${statusCfg.color} text-[10px] px-2 py-0`}
                        >
                          <StatusIcon size={10} className="mr-1" />
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {item.email}
                        </span>
                        {item.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {item.whatsapp}
                          </span>
                        )}
                        {item.instagram && (
                          <span className="flex items-center gap-1">
                            <Instagram size={12} />
                            {item.instagram}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-zinc-500">
                          {formatDate(item.submitted_at)}
                        </span>
                      </div>
                      {item.message && (
                        <p className="mt-2 line-clamp-1 text-xs text-zinc-500">
                          {item.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {item.whatsapp && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(formatWhatsAppUrl(item.whatsapp), "_blank");
                          }}
                        >
                          <Phone size={14} />
                          <span className="hidden sm:inline ml-1">WhatsApp</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-zinc-300 hover:bg-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(item);
                        }}
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        {selectedItem && (
          <DialogContent className="max-w-lg border-white/10 bg-zinc-900 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {selectedItem.full_name}
                <Badge
                  variant="outline"
                  className={`${STATUS_CONFIG[selectedItem.status]?.color} text-[10px] px-2 py-0`}
                >
                  {STATUS_CONFIG[selectedItem.status]?.label || selectedItem.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Contact info */}
              <div className="space-y-2 rounded-lg bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-zinc-500" />
                  <span className="text-sm text-zinc-300">{selectedItem.email}</span>
                </div>
                {selectedItem.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-zinc-500" />
                    <a
                      href={formatWhatsAppUrl(selectedItem.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-400 hover:underline"
                    >
                      {selectedItem.whatsapp}
                    </a>
                  </div>
                )}
                {selectedItem.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram size={14} className="text-zinc-500" />
                    <span className="text-sm text-zinc-300">{selectedItem.instagram}</span>
                  </div>
                )}
                <div className="text-xs text-zinc-500">
                  Leads/mes: {selectedItem.monthly_leads || "No especificado"}
                </div>
                <div className="text-xs text-zinc-500">
                  Recibido: {formatDate(selectedItem.submitted_at)}
                </div>
              </div>

              {/* Message */}
              {selectedItem.message && (
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Mensaje:
                  </p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {selectedItem.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Select value={editingStatus} onValueChange={setEditingStatus}>
                    <SelectTrigger className="flex-1 border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-zinc-900">
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="contactado">Contactado</SelectItem>
                      <SelectItem value="calificado">Calificado</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    onClick={() =>
                      window.open(formatWhatsAppUrl(selectedItem.whatsapp), "_blank")
                    }
                  >
                    <Phone size={14} className="mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-zinc-300 hover:bg-white/5"
                    onClick={() =>
                      window.open(`mailto:${selectedItem.email}`, "_blank")
                    }
                  >
                    <Mail size={14} />
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    Notas internas:
                  </label>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Agregar notas sobre esta persona..."
                    rows={3}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  />
                </div>

                <Button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="w-full bg-gradient-violet text-white hover:opacity-90"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
