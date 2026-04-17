"use client";

import { useState, useMemo } from "react";
import { CalendarEvent, EVENT_TYPES, Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Phone,
  Truck,
  RotateCcw,
  CircleDot,
} from "lucide-react";
import NewEventModal from "./NewEventModal";

interface CalendarioProps {
  events: CalendarEvent[];
  onEventsChange: (events: CalendarEvent[]) => void;
  leads: Lead[];
}

const DAYS = ["Dom", "Lun", "Mar", "Mi\u00e9", "Jue", "Vie", "S\u00e1b"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Phone }> = {
  llamada: {
    label: "Llamada",
    color: "#38BDF8",
    bgColor: "rgba(56, 189, 248, 0.25)",
    borderColor: "rgba(56, 189, 248, 0.6)",
    icon: Phone,
  },
  entrega: {
    label: "Entrega",
    color: "#4ADE80",
    bgColor: "rgba(74, 222, 128, 0.25)",
    borderColor: "rgba(74, 222, 128, 0.6)",
    icon: Truck,
  },
  follow_up: {
    label: "Follow-up",
    color: "#C084FC",
    bgColor: "rgba(192, 132, 252, 0.25)",
    borderColor: "rgba(192, 132, 252, 0.6)",
    icon: RotateCcw,
  },
  otro: {
    label: "Otro",
    color: "#A1A1AA",
    bgColor: "rgba(161, 161, 170, 0.25)",
    borderColor: "rgba(161, 161, 170, 0.6)",
    icon: CircleDot,
  },
};

export default function Calendario({
  events,
  onEventsChange,
  leads,
}: CalendarioProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: number; month: number; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: month - 1,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, month, isCurrentMonth: true });
    }

    // Fill remaining days to complete grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, month: month + 1, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  // Events for the current month sorted by date then time
  const currentMonthEvents = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return events
      .filter((e) => e.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [events, year, month]);

  // Past and future events for the full list below
  const allSortedEvents = useMemo(() => {
    return events.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );
  }, [events]);

  const getDateString = (day: number, m: number) => {
    const y = m < 0 ? year - 1 : m > 11 ? year + 1 : year;
    const mm = m < 0 ? 11 : m > 11 ? 0 : m;
    return `${y}-${String(mm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleDeleteEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowNewEvent(true);
  };

  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} de ${MONTHS[monthIdx]}`;
  };

  const getEventIcon = (type: string) => {
    const config = EVENT_TYPE_CONFIG[type];
    if (!config) return Clock;
    return config.icon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Calendario
          </h1>
          <p className="text-zinc-400">
            Gestiona tus llamadas, entregas y follow-ups
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDate(null);
            setShowNewEvent(true);
          }}
          className="bg-gradient-violet text-white hover:opacity-90"
        >
          <Plus size={16} className="mr-1" />
          Nuevo Evento
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {EVENT_TYPES.map((et) => {
          const config = EVENT_TYPE_CONFIG[et.id];
          const Icon = config?.icon || Clock;
          return (
            <div
              key={et.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{
                backgroundColor: config?.bgColor || `${et.color}20`,
                borderColor: config?.borderColor || `${et.color}40`,
              }}
            >
              <Icon size={14} style={{ color: config?.color || et.color }} />
              <span
                className="text-xs font-semibold"
                style={{ color: config?.color || et.color }}
              >
                {et.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        {/* Month navigation */}
        <div className="mb-5 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-xl font-bold text-white">
            {MONTHS[month]} {year}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold tracking-wider text-violet-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateStr = getDateString(day.date, day.month);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isExpanded = expandedDate === dateStr;

            return (
              <div
                key={idx}
                onClick={() => isExpanded ? setExpandedDate(null) : undefined}
                className={`group relative flex min-h-[80px] flex-col items-start rounded-xl border p-1.5 text-left transition-all sm:min-h-[100px] sm:p-2 ${
                  !day.isCurrentMonth
                    ? "opacity-20"
                    : "hover:border-white/20 hover:bg-white/5 cursor-pointer"
                } ${isToday ? "border-violet-500/50 bg-violet-500/10" : "border-white/5"} ${isExpanded ? "col-span-7 sm:col-span-4 z-10 bg-white/5 border-white/20" : ""}`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm ${
                      isToday
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white font-bold text-xs"
                        : "text-zinc-300 font-medium"
                    }`}
                  >
                    {day.date}
                  </span>
                  {dayEvents.length > 0 && (
                    <span
                      className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                      style={{
                        backgroundColor: EVENT_TYPE_CONFIG[dayEvents[0].type]?.bgColor,
                        color: EVENT_TYPE_CONFIG[dayEvents[0].type]?.color,
                      }}
                    >
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events in cell */}
                <div className="mt-1 w-full space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, isExpanded ? 10 : 2).map((event) => {
                    const config = EVENT_TYPE_CONFIG[event.type];
                    const Icon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-medium border"
                        style={{
                          backgroundColor: config?.bgColor,
                          color: config?.color,
                          borderColor: `${config?.borderColor}40`,
                        }}
                        title={`${event.title} - ${event.time}`}
                      >
                        <Icon size={10} className="shrink-0" />
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {!isExpanded && dayEvents.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDate(dateStr);
                      }}
                      className="w-full rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400 hover:bg-violet-500/30 transition-colors"
                    >
                      +{dayEvents.length - 2} m\u00e1s...
                    </button>
                  )}
                </div>

                {/* Quick add button on hover */}
                {day.isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddEvent(dateStr);
                    }}
                    className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-violet-500"
                    title="Agregar evento"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date detail */}
      {expandedDate && eventsByDate[expandedDate] && eventsByDate[expandedDate].length > 2 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-violet-400" />
            Eventos del {formatDisplayDate(expandedDate)}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {eventsByDate[expandedDate].map((event) => {
              const config = EVENT_TYPE_CONFIG[event.type];
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-xl border p-4 transition-colors"
                  style={{
                    backgroundColor: config?.bgColor,
                    borderColor: config?.borderColor,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: config?.color }}
                  >
                    <Icon size={18} className="text-black" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm">
                      {event.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: config?.color }}>
                      {event.time} · {config?.label}
                    </p>
                    {event.clientName && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Cliente: {event.clientName}
                      </p>
                    )}
                    {event.notes && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {event.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="shrink-0 text-zinc-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Events List - clearly visible */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-5 text-lg font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-violet-400" />
          Todos los Eventos
          <span className="ml-2 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-bold text-violet-400">
            {allSortedEvents.length}
          </span>
        </h3>
        <div className="space-y-3">
          {allSortedEvents.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.type];
            const Icon = getEventIcon(event.type);
            const isPast = event.date < todayStr;
            return (
              <div
                key={event.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                  isPast ? "opacity-50" : ""
                }`}
                style={{
                  backgroundColor: `${config?.bgColor || "rgba(255,255,255,0.05)"}`,
                  borderColor: `${config?.borderColor || "rgba(255,255,255,0.1)"}`,
                }}
              >
                {/* Date block */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-white/10 px-3 py-2 min-w-[60px]">
                  <span className="text-lg font-bold text-white leading-none">
                    {event.date.split("-")[2]}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                    {MONTHS[parseInt(event.date.split("-")[1], 10) - 1]?.substring(0, 3)}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: config?.color || "#a1a1aa",
                  }}
                >
                  <Icon size={20} className="text-black" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {event.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: config?.color }}>
                      <Clock size={10} />
                      {event.time}
                    </span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: config?.bgColor,
                        color: config?.color,
                      }}
                    >
                      {config?.label}
                    </span>
                  </div>
                  {event.clientName && (
                    <p className="text-xs text-zinc-400 mt-1">
                      {event.clientName}
                    </p>
                  )}
                  {event.notes && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                      {event.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {allSortedEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock size={48} className="text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-lg font-medium">
                No hay eventos programados
              </p>
              <p className="text-zinc-600 text-sm mt-1">
                Haz clic en &quot;Nuevo Evento&quot; para agregar uno
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New event modal */}
      {showNewEvent && (
        <NewEventModal
          open={showNewEvent}
          onClose={() => setShowNewEvent(false)}
          onSave={(event) => {
            onEventsChange([...events, event]);
            setShowNewEvent(false);
          }}
          leads={leads}
          defaultDate={selectedDate || undefined}
        />
      )}
    </div>
  );
}
