"use client";

import { Lead } from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/types";
import {
  Users,
  UserCheck,
  ShoppingCart,
  FileText,
  TrendingUp,
  Kanban,
} from "lucide-react";

interface DashboardProps {
  leads: Lead[];
  onNavigate: (tab: "pipeline" | "clientes") => void;
}

export default function Dashboard({ leads, onNavigate }: DashboardProps) {
  const totalLeads = leads.length;
  const activeClients = leads.filter(
    (l) =>
      l.stage !== "venta_cerrada" && l.stage !== "venta_perdida"
  ).length;
  const closedSales = leads.filter(
    (l) => l.stage === "venta_cerrada"
  ).length;
  const pendingQuotes = leads.filter(
    (l) => l.stage === "cotizacion_enviada"
  ).length;
  const totalRevenue = leads
    .filter((l) => l.stage === "venta_cerrada")
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "text-violet",
      bg: "bg-violet/10",
      border: "border-violet/20",
    },
    {
      label: "Clientes Activos",
      value: activeClients,
      icon: UserCheck,
      color: "text-tech-blue",
      bg: "bg-tech-blue/10",
      border: "border-tech-blue/20",
    },
    {
      label: "Ventas Cerradas",
      value: closedSales,
      icon: ShoppingCart,
      color: "text-green-benetton",
      bg: "bg-green-benetton/10",
      border: "border-green-benetton/20",
    },
    {
      label: "Cotizaciones Pendientes",
      value: pendingQuotes,
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
  ];

  // Recent activity: sort leads by lastContact
  const recentActivity = [...leads]
    .sort((a, b) => b.lastContact.localeCompare(a.lastContact))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
        <p className="text-zinc-400">
          Resumen general de tu mueblería
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`glass rounded-2xl border ${stat.border} p-5 transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-zinc-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stat.value}</div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue + Pipeline summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue card */}
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Ingresos por Ventas Cerradas
          </h3>
          <div className="mb-2 text-4xl font-extrabold text-green-benetton">
            ${totalRevenue.toLocaleString("es-MX")}
          </div>
          <p className="text-sm text-zinc-400">
            Total de {closedSales} {closedSales === 1 ? "venta cerrada" : "ventas cerradas"}
          </p>

          {/* Pipeline breakdown */}
          <div className="mt-6 space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = leads.filter(
                (l) => l.stage === stage.id
              ).length;
              const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="flex-1 text-sm text-zinc-300">
                    {stage.label}
                  </span>
                  <span className="text-xs text-zinc-500">{count}</span>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentActivity.map((lead) => {
              const stage = PIPELINE_STAGES.find(
                (s) => s.id === lead.stage
              );
              return (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3 transition-colors hover:bg-white/5"
                >
                  <div
                    className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: stage?.color }}
                  >
                    {lead.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {lead.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {lead.furnitureType}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${stage?.color}20`,
                        color: stage?.color,
                      }}
                    >
                      {stage?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Acciones Rápidas
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate("pipeline")}
            className="inline-flex items-center gap-2 rounded-xl border border-violet/30 bg-violet/10 px-5 py-2.5 text-sm font-medium text-violet-light transition-all hover:bg-violet/20"
          >
            <Kanban size={16} />
            Ver Pipeline
          </button>
          <button
            onClick={() => onNavigate("clientes")}
            className="inline-flex items-center gap-2 rounded-xl border border-tech-blue/30 bg-tech-blue/10 px-5 py-2.5 text-sm font-medium text-tech-blue transition-all hover:bg-tech-blue/20"
          >
            <Users size={16} />
            Ver Clientes
          </button>
        </div>
      </div>
    </div>
  );
}
