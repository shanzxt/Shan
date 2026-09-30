import { useSyncExternalStore } from "react"
import { canUseDOM } from "./env"

// User toggles for the optional layers: probe cursor, sound, CRT mode.
// Persisted in localStorage; defaults are the conservative ones (sound and
// CRT off). Read by the shell, the command palette and the header.
const DEFAULTS = { probe: true, sound: false, crt: false }
const KEY = "signal-settings"

let state = { ...DEFAULTS }
if (canUseDOM) {
  try {
    state = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }
  } catch {
    // unreadable storage: keep defaults
  }
}

const listeners = new Set()

export function getSetting(name) {
  return state[name]
}

export function setSetting(name, value) {
  state = { ...state, [name]: value }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // private mode etc.: the toggle still works for this visit
  }
  listeners.forEach((l) => l())
}

export const toggleSetting = (name) => setSetting(name, !state[name])

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSetting(name) {
  return useSyncExternalStore(
    subscribe,
    () => state[name],
    () => DEFAULTS[name],
  )
}
