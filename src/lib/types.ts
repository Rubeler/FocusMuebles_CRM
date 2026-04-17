export type PipelineStage =
  | "nuevo_lead"
  | "contactado"
  | "cotizacion_enviada"
  | "negociacion"
  | "venta_cerrada"
  | "venta_perdida";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  furnitureType: string;
  estimatedValue: number;
  notes: string;
  stage: PipelineStage;
  lastContact: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "llamada" | "entrega" | "follow_up" | "otro";
  clientId?: string;
  clientName?: string;
  notes: string;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  whatsapp: string;
  instagram: string;
  email: string;
  monthlyLeads: string;
  message: string;
  submittedAt: string;
}

export interface CRMStats {
  totalLeads: number;
  activeClients: number;
  closedSales: number;
  pendingQuotes: number;
  totalRevenue: number;
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: "nuevo_lead", label: "Nuevo Lead", color: "#7C3AED" },
  { id: "contactado", label: "Contactado", color: "#0EA5E9" },
  { id: "cotizacion_enviada", label: "Cotización Enviada", color: "#f59e0b" },
  { id: "negociacion", label: "Negociación", color: "#f97316" },
  { id: "venta_cerrada", label: "Venta Cerrada", color: "#00A651" },
  { id: "venta_perdida", label: "Venta Perdida", color: "#ef4444" },
];

export const EVENT_TYPES: { id: CalendarEvent["type"]; label: string; color: string }[] = [
  { id: "llamada", label: "Llamada", color: "#0EA5E9" },
  { id: "entrega", label: "Entrega", color: "#00A651" },
  { id: "follow_up", label: "Follow-up", color: "#7C3AED" },
  { id: "otro", label: "Otro", color: "#a1a1aa" },
];

export const MONTHLY_LEADS_OPTIONS = [
  { value: "1-10", label: "1-10" },
  { value: "11-30", label: "11-30" },
  { value: "31-50", label: "31-50" },
  { value: "50+", label: "50+" },
];
