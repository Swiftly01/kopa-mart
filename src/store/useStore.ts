import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Listing, SEED_LISTINGS, CATEGORIES as DEFAULT_CATEGORIES, OSUN_LGAS as DEFAULT_LGAS } from "@/data/seed";

export type AccountStatus = "buyer" | "pending" | "verified" | "rejected";
export type Role = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // demo only
  status: AccountStatus;
  role: Role;
  avatar?: string; // data URL
  lastSeen?: number;
  application?: SellerApplication;
  storeProfile?: StoreProfile;
}

export interface SellerApplication {
  fullName: string;
  phone: string;
  stateCode: string;
  location: string;
  ppa?: string;
  idFront?: string;
  idBack?: string;
  faceScan?: string;
  submittedAt: number;
}

export interface StoreProfile {
  storeName: string;
  logo?: string;
  state: string;
  lga: string;
  whatsapp: string;
  delivery: { campMeetup: boolean; localDelivery: boolean };
}

export interface CategoryItem { name: string; emoji: string }

const SUPER_ADMIN_EMAIL = "issaeniola1@gmail.com";

interface State {
  users: User[];
  currentUserId: string | null;
  listings: Listing[];
  saved: Record<string, string[]>;
  pinned: string[];
  theme: "light" | "dark";

  categories: CategoryItem[];
  states: string[];
  lgas: Record<string, string[]>;

  signup: (data: { name: string; email: string; phone: string; password: string }) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  touchActivity: () => void;

  submitApplication: (app: SellerApplication) => void;
  setStoreProfile: (sp: StoreProfile) => void;
  approveSeller: (userId: string) => void;
  rejectSeller: (userId: string) => void;
  setRole: (userId: string, role: Role) => void;
  deleteUser: (userId: string) => void;

  addListing: (l: Omit<Listing, "id" | "createdAt" | "sellerId" | "vendorVerified">) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  togglePinListing: (id: string) => void;

  toggleSaved: (listingId: string) => void;
  isSaved: (listingId: string) => boolean;

  addCategory: (c: CategoryItem) => void;
  removeCategory: (name: string) => void;
  addState: (state: string) => void;
  removeState: (state: string) => void;
  addLga: (state: string, lga: string) => void;
  removeLga: (state: string, lga: string) => void;

  setTheme: (t: "light" | "dark") => void;
}

const DEFAULT_STATES = ["Osun"];
const DEFAULT_LGA_MAP: Record<string, string[]> = { Osun: [...DEFAULT_LGAS] };

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      listings: SEED_LISTINGS,
      saved: {},
      pinned: [],
      theme: "light",
      categories: [...DEFAULT_CATEGORIES, { name: "Cars" as any, emoji: "🚗" }],
      states: DEFAULT_STATES,
      lgas: DEFAULT_LGA_MAP,

      signup: ({ name, email, phone, password }) => {
        const users = get().users;
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL;
        const user: User = {
          id: crypto.randomUUID(),
          name, email, phone, password,
          status: "buyer",
          role: isSuperAdmin ? "superadmin" : "user",
          lastSeen: Date.now(),
        };
        set({ users: [...users, user], currentUserId: user.id });
        return { ok: true };
      },

      login: (email, password) => {
        const u = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!u) return { ok: false, error: "No account with that email." };
        if (u.password !== password) return { ok: false, error: "Incorrect password." };
        set({
          currentUserId: u.id,
          users: get().users.map((x) => (x.id === u.id ? { ...x, lastSeen: Date.now() } : x)),
        });
        return { ok: true };
      },

      logout: () => {
        const id = get().currentUserId;
        if (id) {
          set({ users: get().users.map((u) => (u.id === id ? { ...u, lastSeen: Date.now() } : u)) });
        }
        set({ currentUserId: null });
      },

      updateCurrentUser: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        set({ users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
      },

      resetPassword: (email, newPassword) => {
        const u = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!u) return { ok: false, error: "No account with that email." };
        set({ users: get().users.map((x) => (x.id === u.id ? { ...x, password: newPassword } : x)) });
        return { ok: true };
      },

      touchActivity: () => {
        const id = get().currentUserId;
        if (!id) return;
        set({ users: get().users.map((u) => (u.id === id ? { ...u, lastSeen: Date.now() } : u)) });
      },

      submitApplication: (app) => {
        const id = get().currentUserId;
        if (!id) return;
        set({
          users: get().users.map((u) =>
            u.id === id ? { ...u, status: "pending", application: app } : u,
          ),
        });
      },

      setStoreProfile: (sp) => {
        const id = get().currentUserId;
        if (!id) return;
        set({ users: get().users.map((u) => (u.id === id ? { ...u, storeProfile: sp } : u)) });
      },

      approveSeller: (userId) =>
        set({ users: get().users.map((u) => (u.id === userId ? { ...u, status: "verified" } : u)) }),
      rejectSeller: (userId) =>
        set({ users: get().users.map((u) => (u.id === userId ? { ...u, status: "rejected" } : u)) }),

      setRole: (userId, role) =>
        set({ users: get().users.map((u) => (u.id === userId ? { ...u, role } : u)) }),

      deleteUser: (userId) =>
        set({
          users: get().users.filter((u) => u.id !== userId),
          listings: get().listings.filter((l) => l.sellerId !== userId),
        }),

      addListing: (l) => {
        const id = get().currentUserId;
        const user = get().users.find((u) => u.id === id);
        if (!user || user.status !== "verified") return;
        const listing: Listing = {
          ...l,
          id: crypto.randomUUID(),
          createdAt: Date.now() - 365 * 24 * 3600_000,
          sellerId: user.id,
          vendorVerified: true,
        };
        set({ listings: [...get().listings, listing] });
      },

      updateListing: (id, patch) =>
        set({ listings: get().listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),

      deleteListing: (id) =>
        set({
          listings: get().listings.filter((l) => l.id !== id),
          pinned: get().pinned.filter((p) => p !== id),
        }),

      togglePinListing: (id) => {
        const arr = get().pinned;
        set({ pinned: arr.includes(id) ? arr.filter((x) => x !== id) : [id, ...arr] });
      },

      toggleSaved: (listingId) => {
        const uid = get().currentUserId ?? "guest";
        const arr = get().saved[uid] ?? [];
        const next = arr.includes(listingId) ? arr.filter((x) => x !== listingId) : [...arr, listingId];
        set({ saved: { ...get().saved, [uid]: next } });
      },
      isSaved: (listingId) => {
        const uid = get().currentUserId ?? "guest";
        return (get().saved[uid] ?? []).includes(listingId);
      },

      addCategory: (c) => {
        if (get().categories.find((x) => x.name.toLowerCase() === c.name.toLowerCase())) return;
        set({ categories: [...get().categories, c] });
      },
      removeCategory: (name) =>
        set({ categories: get().categories.filter((c) => c.name !== name) }),

      addState: (state) => {
        const s = state.trim();
        if (!s || get().states.includes(s)) return;
        set({ states: [...get().states, s], lgas: { ...get().lgas, [s]: get().lgas[s] ?? [] } });
      },
      removeState: (state) => {
        const { [state]: _, ...rest } = get().lgas;
        set({ states: get().states.filter((s) => s !== state), lgas: rest });
      },
      addLga: (state, lga) => {
        const s = lga.trim();
        if (!s) return;
        const cur = get().lgas[state] ?? [];
        if (cur.includes(s)) return;
        set({ lgas: { ...get().lgas, [state]: [...cur, s] } });
      },
      removeLga: (state, lga) =>
        set({ lgas: { ...get().lgas, [state]: (get().lgas[state] ?? []).filter((l) => l !== lga) } }),

      setTheme: (t) => {
        set({ theme: t });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", t === "dark");
        }
      },
    }),
    {
      name: "kopa-marketplace",
      version: 3,
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted;
        if (version < 2) {
          persisted.pinned = persisted.pinned ?? [];
          persisted.categories = persisted.categories ?? [...DEFAULT_CATEGORIES, { name: "Cars", emoji: "🚗" }];
          persisted.states = persisted.states ?? DEFAULT_STATES;
          persisted.lgas = persisted.lgas ?? DEFAULT_LGA_MAP;
        }
        if (version < 3) {
          // Migrate admin -> superadmin for the super admin email
          persisted.users = (persisted.users ?? []).map((u: any) => {
            if (u.email?.toLowerCase() === SUPER_ADMIN_EMAIL && u.role === "admin") {
              return { ...u, role: "superadmin" };
            }
            return u;
          });
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.theme === "dark" && typeof document !== "undefined") {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);

export const useCurrentUser = () => {
  const id = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  return id ? users.find((u) => u.id === id) ?? null : null;
};

export const isAdmin = (user: User | null) => user?.role === "admin" || user?.role === "superadmin";
export const isSuperAdmin = (user: User | null) => user?.role === "superadmin";

export const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;
export const isActive = (lastSeen?: number) =>
  !!lastSeen && Date.now() - lastSeen < ACTIVE_THRESHOLD_MS;
