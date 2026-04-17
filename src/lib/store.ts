import { Lead, CalendarEvent, ContactSubmission } from "./types";
import { seedLeads, seedEvents } from "./seed-data";
import {
  supabase,
  isSupabaseReady,
  leadToRow,
  rowToLead,
  eventToRow,
  rowToEvent,
} from "./supabase";

// ─── localStorage helpers (fallback) ──────────────────────────

const LEADS_KEY = "focusmuebles_leads";
const EVENTS_KEY = "focusmuebles_events";
const CONTACTS_KEY = "focusmuebles_contacts";
const SEEDED_KEY = "focusmuebles_seeded";
const WORKSHOP_NAME_KEY = "focusmuebles_workshop_name";
const WORKSHOP_LOGO_KEY = "focusmuebles_workshop_logo";

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Connection status ────────────────────────────────────────

let _supabaseReady: boolean | null = null;

export async function checkSupabaseStatus(): Promise<boolean> {
  if (_supabaseReady !== null) return _supabaseReady;
  _supabaseReady = await isSupabaseReady();
  return _supabaseReady;
}

export function resetSupabaseStatus(): void {
  _supabaseReady = null;
}

export function isUsingSupabase(): boolean {
  return _supabaseReady === true;
}

// ─── Seed data (localStorage only) ────────────────────────────

export function seedDataIfEmpty(): void {
  if (typeof window === "undefined") return;
  const seeded = localStorage.getItem(SEEDED_KEY);
  if (!seeded) {
    setItem(LEADS_KEY, seedLeads);
    setItem(EVENTS_KEY, seedEvents);
    localStorage.setItem(SEEDED_KEY, "true");
  }
}

// ─── Leads ────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((row) => rowToLead(row));
      }
    } catch {
      _supabaseReady = false;
    }
  }
  return getItem<Lead[]>(LEADS_KEY, seedLeads);
}

export async function saveLeads(leads: Lead[]): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      // Upsert all leads: delete existing and re-insert
      // For performance, we use upsert
      const rows = leads.map(leadToRow);
      const { error } = await supabase
        .from("leads")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  setItem(LEADS_KEY, leads);
}

export async function addLead(lead: Lead): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase
        .from("leads")
        .insert(leadToRow(lead));
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads);
  leads.push(lead);
  setItem(LEADS_KEY, leads);
}

export async function updateLead(updatedLead: Lead): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          name: updatedLead.name,
          phone: updatedLead.phone,
          email: updatedLead.email,
          furniture_type: updatedLead.furnitureType,
          estimated_value: updatedLead.estimatedValue,
          notes: updatedLead.notes,
          stage: updatedLead.stage,
          last_contact: updatedLead.lastContact,
        })
        .eq("id", updatedLead.id);
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads).map((l) =>
    l.id === updatedLead.id ? updatedLead : l
  );
  setItem(LEADS_KEY, leads);
}

export async function deleteLead(id: string): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads).filter((l) => l.id !== id);
  setItem(LEADS_KEY, leads);
}

// ─── Events ───────────────────────────────────────────────────

export async function getEvents(): Promise<CalendarEvent[]> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (!error && data) {
        return data.map((row) => rowToEvent(row));
      }
    } catch {
      _supabaseReady = false;
    }
  }
  return getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents);
}

export async function saveEvents(events: CalendarEvent[]): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const rows = events.map(eventToRow);
      const { error } = await supabase
        .from("events")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  setItem(EVENTS_KEY, events);
}

export async function addEvent(event: CalendarEvent): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase
        .from("events")
        .insert(eventToRow(event));
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents);
  events.push(event);
  setItem(EVENTS_KEY, events);
}

export async function updateEvent(updatedEvent: CalendarEvent): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: updatedEvent.title,
          date: updatedEvent.date,
          time: updatedEvent.time,
          type: updatedEvent.type,
          client_id: updatedEvent.clientId || null,
          client_name: updatedEvent.clientName || null,
          notes: updatedEvent.notes,
        })
        .eq("id", updatedEvent.id);
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents).map((e) =>
    e.id === updatedEvent.id ? updatedEvent : e
  );
  setItem(EVENTS_KEY, events);
}

export async function deleteEvent(id: string): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents).filter(
    (e) => e.id !== id
  );
  setItem(EVENTS_KEY, events);
}

// ─── Workshop Settings ────────────────────────────────────────

export async function getWorkshopName(): Promise<string> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      // Try to get any workshop config (use a generic key)
      const { data, error } = await supabase
        .from("workshop_config")
        .select("name")
        .eq("user_id", "global")
        .single();
      if (!error && data) {
        return (data.name as string) || "Muebles y Diseño";
      }
      // If not found, return default (don't insert here)
      if (error && error.code === "PGRST116") {
        return "Muebles y Diseño";
      }
    } catch {
      _supabaseReady = false;
    }
  }
  return getItem<string>(WORKSHOP_NAME_KEY, "Muebles y Diseño");
}

export async function saveWorkshopName(name: string): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { error } = await supabase
        .from("workshop_config")
        .upsert({ user_id: "global", name }, { onConflict: "user_id" });
      if (error) throw error;
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  setItem(WORKSHOP_NAME_KEY, name);
}

export async function getWorkshopLogo(): Promise<string> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      const { data, error } = await supabase
        .from("workshop_config")
        .select("logo")
        .eq("user_id", "global")
        .single();
      if (!error && data) {
        return (data.logo as string) || "";
      }
      if (error && error.code === "PGRST116") {
        return "";
      }
    } catch {
      _supabaseReady = false;
    }
  }
  return getItem<string>(WORKSHOP_LOGO_KEY, "");
}

export async function saveWorkshopLogo(logo: string): Promise<void> {
  const ready = await checkSupabaseStatus();
  if (ready) {
    try {
      // First check if record exists
      const { data: existing } = await supabase
        .from("workshop_config")
        .select("user_id")
        .eq("user_id", "global")
        .single();

      if (existing) {
        await supabase
          .from("workshop_config")
          .update({ logo })
          .eq("user_id", "global");
      } else {
        await supabase
          .from("workshop_config")
          .insert({ user_id: "global", name: "Muebles y Diseño", logo });
      }
      return;
    } catch {
      _supabaseReady = false;
    }
  }
  setItem(WORKSHOP_LOGO_KEY, logo);
}

// ─── Contact Submissions (localStorage only for now) ──────────

export function getContactSubmissions(): ContactSubmission[] {
  return getItem<ContactSubmission[]>(CONTACTS_KEY, []);
}

export function addContactSubmission(submission: ContactSubmission): void {
  const submissions = getContactSubmissions();
  submissions.push(submission);
  setItem(CONTACTS_KEY, submissions);
}
