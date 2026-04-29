import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ByteDisplayMode, BigIntDisplayMode } from '../../store/types'
import { usePreferences, lensActions } from '../../store/lensStore'

export const Route = createFileRoute('/settings/preferences')({
  component: PreferencesRoute,
})

function PreferencesRoute() {
  const preferences = usePreferences()

  const handleByteModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    lensActions.setPreferences({ byteMode: e.target.value as ByteDisplayMode })
  }

  const handleBigIntModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    lensActions.setPreferences({ bigintMode: e.target.value as BigIntDisplayMode })
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-gray-500">Manage your data display settings across the application.</p>
      </div>
      
      <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 pb-6">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Byte Display Mode</span>
            <span className="text-sm text-gray-500">Choose how raw bytes arrays should be formatted</span>
          </div>
          <select 
            value={preferences.byteMode} 
            onChange={handleByteModeChange}
            className="border p-2 rounded w-full sm:max-w-xs focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 cursor-pointer"
          >
            <option value={ByteDisplayMode.HEX}>Hexadecimal</option>
            <option value={ByteDisplayMode.BASE64}>Base64</option>
            <option value={ByteDisplayMode.UTF8}>UTF-8</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100">BigInt Display Mode</span>
            <span className="text-sm text-gray-500">Choose how large integers should be formatted</span>
          </div>
          <select 
            value={preferences.bigintMode} 
            onChange={handleBigIntModeChange}
            className="border p-2 rounded w-full sm:max-w-xs focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 cursor-pointer"
          >
            <option value={BigIntDisplayMode.DECIMAL}>Decimal</option>
            <option value={BigIntDisplayMode.HEX}>Hexadecimal</option>
          </select>
        </div>
        
        <div className="pt-2 flex justify-end">
          <button 
            type="button"
            onClick={() => lensActions.resetPreferences()}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}
