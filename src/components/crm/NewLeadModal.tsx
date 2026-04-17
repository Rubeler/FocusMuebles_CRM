"use client";

import { useState } from "react";
import { Lead, PipelineStage, PIPELINE_STAGES } from "@/lib/types";
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

interface NewLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export default function NewLeadModal({
  open,
  onClose,
  onSave,
}: NewLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [furnitureType, setFurnitureType] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<PipelineStage>("nuevo_lead");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: uuidv4(),
      name,
      phone,
      email,
      furnitureType,
      estimatedValue: Number(estimatedValue) || 0,
      notes,
      stage,
      lastContact: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onSave(lead);
    // Reset form
    setName("");
    setPhone("");
    setEmail("");
    setFurnitureType("");
    setEstimatedValue("");
    setNotes("");
    setStage("nuevo_lead");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-900/95 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nombre del cliente *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Teléfono (WhatsApp) *</Label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de mueble/pedido *</Label>
            <Input
              required
              value={furnitureType}
              onChange={(e) => setFurnitureType(e.target.value)}
              placeholder="Ej: Mesa de comedor, Closet empotrado..."
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
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="15000"
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Etapa inicial</Label>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as PipelineStage)}
              >
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
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
              Crear Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
