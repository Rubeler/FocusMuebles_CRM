import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztwplbqtbxryuypqitan.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0d3BsYnF0YnhyeHV5cHFpdGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDQxMzMsImV4cCI6MjA5MjAyMDEzM30.I2XugPY5VFY1bgJtkUUeAudV0BIXnaWfsu4BD8-DH0U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Check if Supabase is reachable and tables exist.
 * Returns true if we can query the leads table successfully.
 */
export async function isSupabaseReady(): Promise<boolean> {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

/** Map our Lead type to Supabase column names and vice-versa */
export function leadToRow(lead: {
  id: string
  name: string
  phone: string
  email: string
  furnitureType: string
  estimatedValue: number
  notes: string
  stage: string
  lastContact: string
  createdAt: string
}) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    furniture_type: lead.furnitureType,
    estimated_value: lead.estimatedValue,
    notes: lead.notes,
    stage: lead.stage,
    last_contact: lead.lastContact,
    created_at: lead.createdAt,
  }
}

export function rowToLead(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) || '',
    email: (row.email as string) || '',
    furnitureType: (row.furniture_type as string) || '',
    estimatedValue: (row.estimated_value as number) || 0,
    notes: (row.notes as string) || '',
    stage: row.stage as string,
    lastContact: (row.last_contact as string) || '',
    createdAt: (row.created_at as string) || '',
  }
}

export function eventToRow(event: {
  id: string
  title: string
  date: string
  time: string
  type: string
  clientId?: string
  clientName?: string
  notes: string
}) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    type: event.type,
    client_id: event.clientId || null,
    client_name: event.clientName || null,
    notes: event.notes,
  }
}

export function rowToEvent(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    time: (row.time as string) || '',
    type: row.type as string,
    clientId: (row.client_id as string) || undefined,
    clientName: (row.client_name as string) || undefined,
    notes: (row.notes as string) || '',
  }
}

export function userToRow(user: {
  id: string
  email: string
  password: string
  name: string
  role: string
  createdAt: string
}) {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name,
    role: user.role,
    created_at: user.createdAt,
  }
}

export function rowToUser(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    email: row.email as string,
    password: row.password as string,
    name: row.name as string,
    role: row.role as string,
    createdAt: (row.created_at as string) || new Date().toISOString().slice(0, 10),
  }
}
