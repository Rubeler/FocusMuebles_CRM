"use client";

import { useState } from "react";
import { CalendarEvent, EVENT_TYPES, Lead } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { v4 as uuidv4 } from "uuid";

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  leads: Lead[];
  defaultDate?: string;
}

export default function NewEventModal({
  open,
  onClose,
  onSave,
  leads,
  defaultDate,
}: NewEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<CalendarEvent["type"]>("llamada");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find((l) => l.id === clientId);
    const event: CalendarEvent = {
      id: uuidv4(),
      title,
      date,
      time,
      type,
      clientId: clientId || undefined,
      clientName: selectedLead?.name || undefined,
      notes,
    };
    onSave(event);
    // Reset
    setTitle("");
    setDate("");
    setTime("10:00");
    setType("llamada");
    setClientId("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-900/95 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Llamada con María García"
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Hora *</Label>
              <Input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as CalendarEvent["type"])}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  {EVENT_TYPES.map((et) => (
                    <SelectItem key={et.id} value={et.id}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente asociado</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles del evento..."
              rows={3}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-violet text-white hover:opacity-90"
            >
              Crear Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
