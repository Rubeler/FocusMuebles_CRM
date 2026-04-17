"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Lead, PipelineStage, PIPELINE_STAGES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Phone, GripVertical } from "lucide-react";
import NewLeadModal from "./NewLeadModal";

interface PipelineProps {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
}

/* ─── Module-level ref to track dragged lead ID ─────────────── */
const draggedLeadIdRef = { current: null as string | null };

/* ─── Lead Card ─────────────────────────────────────────────── */

function LeadCard({ lead }: { lead: Lead }) {
  const waLink = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", lead.id);
        draggedLeadIdRef.current = lead.id;
      }}
      onDragEnd={() => {
        draggedLeadIdRef.current = null;
      }}
      className="glass group relative rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-150 select-none hover:border-white/20 hover:shadow-lg hover:shadow-violet/5"
    >
      <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
        <GripVertical size={14} className="text-zinc-400" />
      </div>
      <div className="mb-2 flex items-start justify-between gap-2 pl-4">
        <span className="text-sm font-semibold text-white leading-tight">
          {lead.name}
        </span>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-green-500/70 transition-colors hover:text-green-400 mt-0.5"
          title="WhatsApp"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={13} />
        </a>
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-zinc-400 pl-4">
        {lead.furnitureType}
      </p>
      <div className="flex items-center justify-between pl-4">
        <span className="text-sm font-bold text-violet-400">
          ${lead.estimatedValue.toLocaleString("es-MX")}
        </span>
        <span className="text-[11px] text-zinc-500">{lead.lastContact}</span>
      </div>
    </div>
  );
}

/* ─── Pipeline Column ───────────────────────────────────────── */

function PipelineColumn({
  stage,
  leads,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  leads: Lead[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const enterCount = useRef(0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
        <h3 className="text-sm font-bold text-zinc-200 truncate">{stage.label}</h3>
        <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-zinc-400">
          {leads.length}
        </span>
      </div>

      <div
        className={`flex flex-col gap-2 rounded-xl p-2 min-h-[200px] transition-all duration-200 ${
          isDragOver
            ? "border-2 border-dashed border-violet-500 bg-violet-500/10"
            : "border-2 border-dashed border-transparent"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          enterCount.current += 1;
          onDragOver(e);
        }}
        onDragLeave={() => {
          enterCount.current -= 1;
          if (enterCount.current <= 0) {
            enterCount.current = 0;
            onDragLeave();
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          enterCount.current = 0;
          onDrop(e);
        }}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver
                ? "border border-violet-500/40 bg-violet-500/5"
                : "border border-dashed border-white/5"
            }`}
          >
            <div className={`mb-2 text-3xl transition-colors ${isDragOver ? "animate-bounce text-violet-400" : "text-zinc-700"}`}>
              ⬇
            </div>
            <p className={`text-xs font-medium transition-colors ${isDragOver ? "text-violet-400" : "text-zinc-500"}`}>
              {isDragOver ? "Soltar aquí" : "Sin leads"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Pipeline ─────────────────────────────────────────── */

export default function Pipeline({ leads, onLeadsChange }: PipelineProps) {
  const [showNewLead, setShowNewLead] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Safety: always reset visual state on dragend / drop
  useEffect(() => {
    const reset = () => {
      setDragOverStage(null);
    };
    window.addEventListener("dragend", reset);
    return () => window.removeEventListener("dragend", reset);
  }, []);

  const leadsByStage = useMemo(() => {
    const map: Record<PipelineStage, Lead[]> = {
      nuevo_lead: [],
      contactado: [],
      cotizacion_enviada: [],
      negociacion: [],
      venta_cerrada: [],
      venta_perdida: [],
    };
    leads.forEach((lead) => {
      if (map[lead.stage]) map[lead.stage].push(lead);
    });
    return map;
  }, [leads]);

  const handleDropOnStage = useCallback(
    (stageId: PipelineStage, e: React.DragEvent) => {
      // Read the lead ID directly from the drop event dataTransfer
      const leadId = e.dataTransfer.getData("text/plain");
      if (!leadId) {
        setDragOverStage(null);
        return;
      }

      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.stage === stageId) {
        setDragOverStage(null);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const updated = leads.map((l) =>
        l.id === leadId
          ? { ...l, stage: stageId as PipelineStage, lastContact: today }
          : l
      );
      onLeadsChange(updated);
      setDragOverStage(null);
    },
    [leads, onLeadsChange]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Pipeline</h1>
          <p className="text-zinc-400">Arrastra y suelta para mover leads entre etapas</p>
        </div>
        <Button
          onClick={() => setShowNewLead(true)}
          className="bg-gradient-violet text-white hover:opacity-90"
        >
          <Plus size={16} className="mr-1" />
          Nuevo Lead
        </Button>
      </div>

      {/* Drag banner */}
      {dragOverStage && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
          <GripVertical size={18} className="text-violet-400 shrink-0" />
          <span className="text-sm text-violet-300">
            Moviendo a: <strong className="text-white">{PIPELINE_STAGES.find((s) => s.id === dragOverStage)?.label}</strong>
          </span>
          <span className="text-xs text-zinc-500">→ Soltá el lead aquí</span>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id]}
              isDragOver={dragOverStage === stage.id}
              onDragOver={() => setDragOverStage(stage.id)}
              onDragLeave={() => {
                if (dragOverStage === stage.id) setDragOverStage(null);
              }}
              onDrop={(e) => handleDropOnStage(stage.id, e)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showNewLead && (
        <NewLeadModal
          open={showNewLead}
          onClose={() => setShowNewLead(false)}
          onSave={(lead) => {
            onLeadsChange([...leads, lead]);
            setShowNewLead(false);
          }}
        />
      )}
    </div>
  );
}
