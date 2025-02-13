import useSWR from 'swr'

import { LocalStorageHookResult } from '../types'
import { isServerSide } from '../utils'

/**
 * Gets and sets value to/from local storage.
 *
 * @param key key to get and set value to/from local storage.
 * @param defaultValue default value that is returned incase the key was not found.
 *
 * @returns an array of (the saved value, set value function, and remove value function) in the same order.
 */
const useLocalStorage = <T>(
  key: string,
  defaultValue: T | null = null,
): LocalStorageHookResult<T> => {
  let initialValue = defaultValue

  // @ts-ignore
  const fetcher = (url) => {
    if (!isServerSide()) {
      let storedValue = window.localStorage.getItem(key)
      if (storedValue !== null && storedValue !== 'undefined') {
        const parsedValue = JSON.parse(storedValue)
        if (Date.now() - parsedValue.setupTime <= 20 * 60 * 1000) {
          // invalidate after 20 minutes
          return parsedValue
        }
      }
    }
    return defaultValue
  }

  const { data: value = initialValue, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    refreshInterval: 5 * 60 * 1000, // forces web app to fetch data again every 5 minutes, in essence triggering
    // the setupTime check every 5 minutes
  })

  // ========== Set value ==========
  const setValue = async (value: T): Promise<void> => {
    const valueWithSetupTime = { ...value, setupTime: Date.now() }

    await mutate(valueWithSetupTime, false)

    if (isServerSide()) {
      return
    }

    // Save to local storage
    const localStorageValue = JSON.stringify(valueWithSetupTime)
    window.localStorage.setItem(key, localStorageValue)
  }

  // ========== Remove value ==========
  const removeValue = async (): Promise<void> => {
    await mutate(defaultValue, false)

    if (isServerSide()) {
      return
    }

    // Remove value from local storage
    window.localStorage.removeItem(key)
  }

  return [value, setValue, removeValue]
}

export default useLocalStorage
