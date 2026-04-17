"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient, isSupabaseReady, userToRow, rowToUser } from "./supabase";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    name: string;
  }) => Promise<{ success: boolean; error?: string }>;
  users: User[];
  deleteUser: (userId: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "focusmuebles_users";
const CURRENT_USER_KEY = "focusmuebles_current_user";

const DEFAULT_ADMIN: User = {
  id: "admin-001",
  email: "admin@focusmuebles.com",
  password: "admin123",
  name: "Administrador",
  role: "admin",
  createdAt: new Date().toISOString().slice(0, 10),
};

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

function seedAdmin(): void {
  if (typeof window === "undefined") return;
  const users = getItem<User[]>(USERS_KEY, []);
  const adminIndex = users.findIndex((u) => u.email === DEFAULT_ADMIN.email);
  if (adminIndex >= 0) {
    users[adminIndex].password = DEFAULT_ADMIN.password;
  } else {
    users.push(DEFAULT_ADMIN);
  }
  setItem(USERS_KEY, users);
}

let _supabaseReady: boolean | null = null;

const emptySubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    seedAdmin();
    return getItem<User[]>(USERS_KEY, []);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionInitialized = useRef(false);

  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    seedAdmin();
    const stored = getItem<User | null>(CURRENT_USER_KEY, null);
    if (stored) setCurrentUser(stored);

    // Check Supabase in background (non-blocking, with timeout)
    const timer = setTimeout(() => setLoading(false), 800);

    (async () => {
      try {
        const ok = await isSupabaseReady();
        _supabaseReady = ok;
        if (ok) {
          const client = getSupabaseClient();
          if (client) {
            const { data, error } = await client.from("users").select("*").order("created_at", { ascending: true });
            if (!error && data && data.length > 0) {
              const supabaseUsers = data.map(rowToUser);
              setUsers(supabaseUsers);
              setItem(USERS_KEY, supabaseUsers);
            }
          }
        }
      } catch {
        _supabaseReady = false;
      }
      clearTimeout(timer);
      setLoading(false);
    })();
  }, [isClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      seedAdmin();

      // Try Supabase
      if (_supabaseReady === true) {
        try {
          const client = getSupabaseClient();
          if (client) {
            const { data, error } = await client
              .from("users")
              .select("*")
              .eq("email", email)
              .eq("password", password)
              .single();
            if (!error && data) {
              const user = rowToUser(data);
              setCurrentUser(user);
              setItem(CURRENT_USER_KEY, user);
              router.push(user.role === "admin" ? "/admin" : "/crm");
              return { success: true };
            }
          }
        } catch {
          _supabaseReady = false;
        }
      }

      // Fallback localStorage
      const currentUsers = getItem<User[]>(USERS_KEY, []);
      const user = currentUsers.find((u) => u.email === email && u.password === password);
      if (!user) return { success: false, error: "Correo o contraseña incorrectos" };
      setCurrentUser(user);
      setItem(CURRENT_USER_KEY, user);
      router.push(user.role === "admin" ? "/admin" : "/crm");
      return { success: true };
    },
    [users, router]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(CURRENT_USER_KEY);
    router.push("/login");
  }, [router]);

  const register = useCallback(
    async (userData: { email: string; password: string; name: string }) => {
      const { email, password, name } = userData;
      if (!email || !password || !name) return { success: false, error: "Todos los campos son obligatorios" };
      if (password.length < 4) return { success: false, error: "La contraseña debe tener al menos 4 caracteres" };
      if (users.some((u) => u.email === email)) return { success: false, error: "Este correo ya está registrado" };

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        role: "user",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      if (_supabaseReady === true) {
        try {
          const client = getSupabaseClient();
          if (client) {
            const { error } = await client.from("users").insert(userToRow(newUser));
            if (error) throw error;
          }
        } catch { _supabaseReady = false; }
      }

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setItem(USERS_KEY, updatedUsers);
      return { success: true };
    },
    [users]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      if (currentUser?.id === userId) return;

      if (_supabaseReady === true) {
        try {
          const client = getSupabaseClient();
          if (client) {
            const { error } = await client.from("users").delete().eq("id", userId);
            if (error) throw error;
          }
        } catch { _supabaseReady = false; }
      }

      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      setItem(USERS_KEY, updatedUsers);
    },
    [users, currentUser]
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated: !!currentUser, login, logout, register, users, deleteUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}
