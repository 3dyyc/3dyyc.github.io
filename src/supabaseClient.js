import { createClient } from "@supabase/supabase-js";

// Данные вашего проекта Supabase
const SUPABASE_URL = "https://cmbcgebjssfzevxohrtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_g9MY0VJFrYsbrMy8SE0hMw_GV9EnHnf";

const AUTH_MODE_KEY = "3dyyc_auth_storage_mode";
const AUTH_STORAGE_KEY = "sb-cmbcgebjssfzevxohrtl-auth-token";

function getAuthStorage() {
  try {
    return localStorage.getItem(AUTH_MODE_KEY) === "session" ? sessionStorage : localStorage;
  } catch (e) {
    return sessionStorage;
  }
}

export function setAuthStorageMode(rememberMe) {
  try {
    localStorage.setItem(AUTH_MODE_KEY, rememberMe ? "local" : "session");
    if (!rememberMe) localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    // Некоторые браузеры запрещают доступ к хранилищу в приватном режиме.
  }
}

const authStorage = {
  getItem: async (key) => {
    try { return getAuthStorage().getItem(key); } catch (e) { return null; }
  },
  setItem: async (key, value) => {
    try {
      const target = getAuthStorage();
      const other = target === localStorage ? sessionStorage : localStorage;
      other.removeItem(key);
      target.setItem(key, value);
    } catch (e) {
      // Не сохраняем токены в обход выбранного режима.
    }
  },
  removeItem: async (key) => {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: authStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
