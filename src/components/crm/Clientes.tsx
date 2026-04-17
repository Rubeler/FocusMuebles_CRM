"use client";

import { useState, useMemo } from "react";
import { Lead, PipelineStage, PIPELINE_STAGES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
} from "lucide-react";

interface ClientesProps {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
}

export default function Clientes({ leads, onLeadsChange }: ClientesProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    let result = leads;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.furnitureType.toLowerCase().includes(q)
      );
    }

    if (stageFilter !== "all") {
      result = result.filter((l) => l.stage === stageFilter);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [leads, search, stageFilter]);

  const handleDelete = (id: string) => {
    onLeadsChange(leads.filter((l) => l.id !== id));
    setExpandedId(null);
  };

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const updatedLead: Lead = {
      ...editingLead,
      name: data.get("editName") as string || editingLead.name,
      phone: data.get("editPhone") as string || editingLead.phone,
      email: data.get("editEmail") as string || editingLead.email,
      furnitureType: data.get("editFurnitureType") as string || editingLead.furnitureType,
      estimatedValue: Number(data.get("editValue")) || editingLead.estimatedValue,
      notes: data.get("editNotes") as string || editingLead.notes,
      stage: data.get("editStage") as PipelineStage || editingLead.stage,
      lastContact: new Date().toISOString().slice(0, 10),
    };

    onLeadsChange(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    setEditingLead(null);
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Clientes
        </h1>
        <p className="text-zinc-400">
          {filteredLeads.length} de {leads.length} clientes
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email o mueble..."
            className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="all" className="bg-zinc-900">
            Todas las etapas
          </option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.id} value={s.id} className="bg-zinc-900">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {filteredLeads.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-zinc-500">No se encontraron clientes</p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const stage = PIPELINE_STAGES.find((s) => s.id === lead.stage);
            const isExpanded = expandedId === lead.id;
            const waLink = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`;

            return (
              <div
                key={lead.id}
                className="glass rounded-xl transition-all duration-200"
              >
                {/* Row */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : lead.id)
                  }
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: stage?.color || "#7C3AED" }}
                  >
                    {lead.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {lead.name}
                      </span>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: `${stage?.color}20`,
                          color: stage?.color,
                          border: "none",
                        }}
                      >
                        {stage?.label}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-zinc-400">
                      {lead.phone} · {lead.furnitureType}
                    </p>
                  </div>

                  <span className="hidden font-bold text-violet-light sm:block">
                    ${lead.estimatedValue.toLocaleString("es-MX")}
                  </span>

                  {isExpanded ? (
                    <ChevronUp size={18} className="text-zinc-500" />
                  ) : (
                    <ChevronDown size={18} className="text-zinc-500" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 animate-fade-in">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">Teléfono</p>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-green-benetton hover:underline"
                        >
                          <ExternalLink size={12} />
                          {lead.phone}
                        </a>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">Email</p>
                        <p className="text-sm text-zinc-300">
                          {lead.email || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">Valor estimado</p>
                        <p className="text-sm font-bold text-violet-light">
                          ${lead.estimatedValue.toLocaleString("es-MX")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">Tipo de mueble</p>
                        <p className="text-sm text-zinc-300">{lead.furnitureType}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-zinc-500">Último contacto</p>
                        <p className="text-sm text-zinc-300">{lead.lastContact}</p>
                      </div>
                    </div>
                    {lead.notes && (
                      <div className="mt-4">
                        <p className="mb-1 text-xs text-zinc-500">Notas</p>
                        <p className="text-sm text-zinc-400">{lead.notes}</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLead(lead)}
                        className="text-tech-blue hover:bg-tech-blue/10 hover:text-blue-300"
                      >
                        <Pencil size={14} className="mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingLead} onOpenChange={(open) => { if (!open) setEditingLead(null); }}>
        <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-900/95 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <form onSubmit={handleEditSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nombre del cliente *</Label>
                <Input
                  required
                  name="editName"
                  defaultValue={editingLead.name}
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Teléfono (WhatsApp) *</Label>
                  <Input
                    required
                    name="editPhone"
                    defaultValue={editingLead.phone}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="editEmail"
                    defaultValue={editingLead.email}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de mueble/pedido *</Label>
                <Input
                  required
                  name="editFurnitureType"
                  defaultValue={editingLead.furnitureType}
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Presupuesto estimado *</Label>
                  <Input
                    required
                    type="number"
                    min={0}
                    name="editValue"
                    defaultValue={editingLead.estimatedValue}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Etapa</Label>
                  <Select name="editStage" defaultValue={editingLead.stage}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-zinc-900">
                      {PIPELINE_STAGES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  name="editNotes"
                  defaultValue={editingLead.notes}
                  rows={3}
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLead(null)}
                  className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-violet text-white hover:opacity-90"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
