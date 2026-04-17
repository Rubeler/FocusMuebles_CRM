"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lead, CalendarEvent } from "@/lib/types";
import {
  seedDataIfEmpty,
  getLeads,
  saveLeads,
  getEvents,
  saveEvents,
  isUsingSupabase,
  checkSupabaseStatus,
} from "@/lib/store";
import Dashboard from "@/components/crm/Dashboard";
import { Database, HardDrive } from "lucide-react";

export default function CRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      seedDataIfEmpty();

      // Check Supabase status and load data
      await checkSupabaseStatus();
      const supabaseActive = isUsingSupabase();
      setUsingSupabase(supabaseActive);

      const loadedLeads = await getLeads();
      const loadedEvents = await getEvents();
      setLeads(loadedLeads);
      setEvents(loadedEvents);
      setReady(true);
    };
    loadData();
  }, []);

  const handleLeadsChange = useCallback(async (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    await saveLeads(updatedLeads);
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
      {/* Storage indicator */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            usingSupabase
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
          }`}
        >
          {usingSupabase ? (
            <Database size={12} />
          ) : (
            <HardDrive size={12} />
          )}
          {usingSupabase ? "Supabase conectado" : "Almacenamiento local"}
        </div>
      </div>
      <Dashboard
        leads={leads}
        onNavigate={(tab) => router.push(`/crm/${tab}`)}
      />
    </>
  );
}
