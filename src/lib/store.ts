import { Lead, CalendarEvent, ContactSubmission } from "./types";
import { seedLeads, seedEvents } from "./seed-data";
import {
  getSupabaseClient,
  isSupabaseReady,
  leadToRow,
  rowToLead,
  eventToRow,
  rowToEvent,
} from "./supabase";

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

let _sbReady: boolean | null = null;

async function sb(): Promise<ReturnType<typeof getSupabaseClient>> {
  if (_sbReady === false) return null;
  if (_sbReady === true) return getSupabaseClient();
  const ok = await isSupabaseReady();
  _sbReady = ok;
  return ok ? getSupabaseClient() : null;
}

function sbFail() { _sbReady = false; }

export async function checkSupabaseStatus(): Promise<boolean> {
  const client = await sb();
  return client !== null;
}

export function isUsingSupabase(): boolean {
  return _sbReady === true;
}

export function resetSupabaseStatus(): void {
  _sbReady = null;
}

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
  const client = await sb();
  if (client) {
    try {
      const { data, error } = await client
        .from("leads")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) return data.map((row) => rowToLead(row));
    } catch { sbFail(); }
  }
  return getItem<Lead[]>(LEADS_KEY, seedLeads);
}

export async function saveLeads(leads: Lead[]): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client
        .from("leads")
        .upsert(leads.map(leadToRow), { onConflict: "id" });
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  setItem(LEADS_KEY, leads);
}

export async function addLead(lead: Lead): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client.from("leads").insert(leadToRow(lead));
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads);
  leads.push(lead);
  setItem(LEADS_KEY, leads);
}

export async function updateLead(updatedLead: Lead): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client
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
    } catch { sbFail(); }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads).map((l) =>
    l.id === updatedLead.id ? updatedLead : l
  );
  setItem(LEADS_KEY, leads);
}

export async function deleteLead(id: string): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client.from("leads").delete().eq("id", id);
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  const leads = getItem<Lead[]>(LEADS_KEY, seedLeads).filter((l) => l.id !== id);
  setItem(LEADS_KEY, leads);
}

// ─── Events ───────────────────────────────────────────────────

export async function getEvents(): Promise<CalendarEvent[]> {
  const client = await sb();
  if (client) {
    try {
      const { data, error } = await client
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (!error && data) return data.map((row) => rowToEvent(row));
    } catch { sbFail(); }
  }
  return getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents);
}

export async function saveEvents(events: CalendarEvent[]): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client
        .from("events")
        .upsert(events.map(eventToRow), { onConflict: "id" });
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  setItem(EVENTS_KEY, events);
}

export async function addEvent(event: CalendarEvent): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client.from("events").insert(eventToRow(event));
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents);
  events.push(event);
  setItem(EVENTS_KEY, events);
}

export async function updateEvent(updatedEvent: CalendarEvent): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client
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
    } catch { sbFail(); }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents).map((e) =>
    e.id === updatedEvent.id ? updatedEvent : e
  );
  setItem(EVENTS_KEY, events);
}

export async function deleteEvent(id: string): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client.from("events").delete().eq("id", id);
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  const events = getItem<CalendarEvent[]>(EVENTS_KEY, seedEvents).filter(
    (e) => e.id !== id
  );
  setItem(EVENTS_KEY, events);
}

// ─── Workshop Settings ────────────────────────────────────────

export async function getWorkshopName(): Promise<string> {
  const client = await sb();
  if (client) {
    try {
      const { data, error } = await client
        .from("workshop_config")
        .select("name")
        .eq("user_id", "global")
        .single();
      if (!error && data) return (data.name as string) || "Muebles y Diseño";
      if (error && error.code === "PGRST116") return "Muebles y Diseño";
    } catch { sbFail(); }
  }
  return getItem<string>(WORKSHOP_NAME_KEY, "Muebles y Diseño");
}

export async function saveWorkshopName(name: string): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { error } = await client
        .from("workshop_config")
        .upsert({ user_id: "global", name }, { onConflict: "user_id" });
      if (error) throw error;
      return;
    } catch { sbFail(); }
  }
  setItem(WORKSHOP_NAME_KEY, name);
}

export async function getWorkshopLogo(): Promise<string> {
  const client = await sb();
  if (client) {
    try {
      const { data, error } = await client
        .from("workshop_config")
        .select("logo")
        .eq("user_id", "global")
        .single();
      if (!error && data) return (data.logo as string) || "";
      if (error && error.code === "PGRST116") return "";
    } catch { sbFail(); }
  }
  return getItem<string>(WORKSHOP_LOGO_KEY, "");
}

export async function saveWorkshopLogo(logo: string): Promise<void> {
  const client = await sb();
  if (client) {
    try {
      const { data: existing } = await client
        .from("workshop_config")
        .select("user_id")
        .eq("user_id", "global")
        .single();
      if (existing) {
        await client.from("workshop_config").update({ logo }).eq("user_id", "global");
      } else {
        await client.from("workshop_config").insert({ user_id: "global", name: "Muebles y Diseño", logo });
      }
      return;
    } catch { sbFail(); }
  }
  setItem(WORKSHOP_LOGO_KEY, logo);
}

// ─── Contact Submissions (localStorage only) ──────────────────

export function getContactSubmissions(): ContactSubmission[] {
  return getItem<ContactSubmission[]>(CONTACTS_KEY, []);
}

export function addContactSubmission(submission: ContactSubmission): void {
  const submissions = getContactSubmissions();
  submissions.push(submission);
  setItem(CONTACTS_KEY, submissions);
}
