import { createJSONStorage } from 'zustand/middleware'

import { DEFAULT_NETWORKS, ByteDisplayMode, BigIntDisplayMode } from './types'
import { validateNetworkConfigPatch } from './validateNetworkConfigPatch'

import type { NetworkConfig, PreferencesConfig } from './types'
import type { PersistStorage } from 'zustand/middleware'

/**
 * Storage key for network config persistence
 */
export const NETWORK_CONFIG_STORAGE_KEY = 'ssl.network-config.v1'

/**
 * Default network config used when storage is missing or corrupt
 */
export const DEFAULT_NETWORK_CONFIG: NetworkConfig = DEFAULT_NETWORKS.futurenet

/**
 * Persisted state shape (only networkConfig)
 */
export interface PersistedState {
  networkConfig: NetworkConfig
  preferences: PreferencesConfig
}

/**
 * Validates that a value is a valid NetworkConfig object
 */
export function isValidNetworkConfig(value: unknown): value is NetworkConfig {
  const result = validateNetworkConfigPatch(value)

  if (!result.valid || !result.patch) {
    return false
  }

  // Ensure all required fields are present and non-empty
  const { networkId, networkPassphrase, rpcUrl } = result.patch

  return (
    typeof networkId === 'string' &&
    networkId.length > 0 &&
    typeof networkPassphrase === 'string' &&
    networkPassphrase.length > 0 &&
    typeof rpcUrl === 'string' &&
    rpcUrl.length > 0
  )
}

/**
 * Validates that a value is a valid PreferencesConfig object
 */
export function isValidPreferencesConfig(
  value: unknown,
): value is PreferencesConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const { byteMode, bigintMode } = value as Record<string, unknown>

  return (
    (Object.values(ByteDisplayMode) as unknown[]).includes(byteMode) &&
    (Object.values(BigIntDisplayMode) as unknown[]).includes(bigintMode)
  )
}

/**
 * Safe localStorage wrapper that handles errors gracefully
 */
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') {
        return null
      }
      return localStorage.getItem(name)
    } catch {
      console.warn(`[LensStore] Failed to read from localStorage: ${name}`)
      return null
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      localStorage.setItem(name, value)
    } catch {
      console.warn(`[LensStore] Failed to write to localStorage: ${name}`)
    }
  },

  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      localStorage.removeItem(name)
    } catch {
      console.warn(`[LensStore] Failed to remove from localStorage: ${name}`)
    }
  },
}

/**
 * Create safe storage for persist middleware
 */
export const createSafeStorage = <T>(): PersistStorage<T> | undefined =>
  createJSONStorage<T>(() => safeLocalStorage)

/**
 * Hydration merge function that validates persisted data
 * Returns default config if persisted data is invalid
 */
export function mergeNetworkConfig(
  persistedState: unknown,
  currentState: { networkConfig: NetworkConfig },
): { networkConfig: NetworkConfig } {
  if (
    typeof persistedState === 'object' &&
    persistedState !== null &&
    'networkConfig' in persistedState
  ) {
    const persisted = persistedState as { networkConfig: unknown }

    if (isValidNetworkConfig(persisted.networkConfig)) {
      return { networkConfig: persisted.networkConfig }
    } else {
      console.warn(
        '[LensStore] Persisted network config is invalid, falling back to default',
        persisted.networkConfig,
      )
    }
  }

  // Return current state (with defaults) if persisted data is invalid or missing
  return currentState
}

/**
 * Hydration merge function that validates persisted preferences data
 */
export function mergePreferences(
  persistedState: unknown,
  currentState: { preferences: PreferencesConfig },
): { preferences: PreferencesConfig } {
  if (
    typeof persistedState === 'object' &&
    persistedState !== null &&
    'preferences' in persistedState
  ) {
    const persisted = persistedState as { preferences: unknown }

    if (isValidPreferencesConfig(persisted.preferences)) {
      return { preferences: persisted.preferences }
    } else {
      console.warn(
        '[LensStore] Persisted preferences config is invalid, falling back to default',
        persisted.preferences,
      )
    }
  }

  return currentState
}

/**
 * Clear persisted network config (for testing)
 */
export function clearPersistedNetworkConfig(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(NETWORK_CONFIG_STORAGE_KEY)
    }
  } catch {
    // Ignore errors during cleanup
  }
}
