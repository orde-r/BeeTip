/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const SECURITY_CODE_STORAGE_KEY = 'beetip.securityCodes'

type SecurityCodeContextValue = {
  codesByOrderId: Record<string, string>
  getSecurityCode: (orderId: string) => string | null
  saveSecurityCode: (orderId: string, code: string) => void
  clearSecurityCode: (orderId: string) => void
  clearAllSecurityCodes: () => void
}

const SecurityCodeContext = createContext<SecurityCodeContextValue | null>(null)

function readStoredSecurityCodes() {
  const storedCodes = window.sessionStorage.getItem(SECURITY_CODE_STORAGE_KEY)

  if (!storedCodes) {
    return {}
  }

  try {
    const parsedCodes = JSON.parse(storedCodes)
    return typeof parsedCodes === 'object' && parsedCodes !== null
      ? (parsedCodes as Record<string, string>)
      : {}
  } catch {
    return {}
  }
}

function writeStoredSecurityCodes(codesByOrderId: Record<string, string>) {
  window.sessionStorage.setItem(
    SECURITY_CODE_STORAGE_KEY,
    JSON.stringify(codesByOrderId),
  )
}

export function SecurityCodeProvider({ children }: { children: ReactNode }) {
  const [codesByOrderId, setCodesByOrderId] = useState<Record<string, string>>(
    readStoredSecurityCodes,
  )

  const value = useMemo<SecurityCodeContextValue>(
    () => ({
      codesByOrderId,
      getSecurityCode(orderId) {
        return codesByOrderId[orderId] ?? null
      },
      saveSecurityCode(orderId, code) {
        setCodesByOrderId((currentCodes) => {
          const nextCodes = {
            ...currentCodes,
            [orderId]: code,
          }

          writeStoredSecurityCodes(nextCodes)
          return nextCodes
        })
      },
      clearSecurityCode(orderId) {
        setCodesByOrderId((currentCodes) => {
          const nextCodes = { ...currentCodes }
          delete nextCodes[orderId]
          writeStoredSecurityCodes(nextCodes)
          return nextCodes
        })
      },
      clearAllSecurityCodes() {
        window.sessionStorage.removeItem(SECURITY_CODE_STORAGE_KEY)
        setCodesByOrderId({})
      },
    }),
    [codesByOrderId],
  )

  return (
    <SecurityCodeContext.Provider value={value}>
      {children}
    </SecurityCodeContext.Provider>
  )
}

export function useSecurityCodes() {
  const context = useContext(SecurityCodeContext)

  if (!context) {
    throw new Error('useSecurityCodes must be used within SecurityCodeProvider')
  }

  return context
}
