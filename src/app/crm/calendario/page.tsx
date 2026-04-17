"use client";

import { useState, useCallback, useEffect } from "react";
import { Lead, CalendarEvent } from "@/lib/types";
import { seedDataIfEmpty, getLeads, getEvents, saveEvents, saveLeads, isUsingSupabase, checkSupabaseStatus } from "@/lib/store";
import Calendario from "@/components/crm/Calendario";
import { Database, HardDrive } from "lucide-react";

export default function CalendarioPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      seedDataIfEmpty();
      await checkSupabaseStatus();
      setUsingSupabase(isUsingSupabase());
      const loadedLeads = await getLeads();
      const loadedEvents = await getEvents();
      setLeads(loadedLeads);
      setEvents(loadedEvents);
      setReady(true);
    };
    loadData();
  }, []);

  const handleEventsChange = useCallback(async (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    await saveEvents(updatedEvents);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            usingSupabase
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
          }`}
        >
          {usingSupabase ? <Database size={12} /> : <HardDrive size={12} />}
          {usingSupabase ? "Supabase conectado" : "Almacenamiento local"}
        </div>
      </div>
      <Calendario
        events={events}
        onEventsChange={handleEventsChange}
        leads={leads}
      />
    </>
  );
}
