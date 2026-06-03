import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createJSONStorage, persist } from 'zustand/middleware'

const SECURITY_CODE_STORAGE_KEY = 'beetip.securityCodes'

type SecurityCodeState = {
  codesByOrderId: Record<string, string>
  getSecurityCode: (orderId: string) => string | null
  saveSecurityCode: (orderId: string, code: string) => void
  clearSecurityCode: (orderId: string) => void
  clearAllSecurityCodes: () => void
}

export const useSecurityCodeStore = create<SecurityCodeState>()(
  persist(
    (set, get) => ({
      codesByOrderId: {},
      getSecurityCode(orderId) {
        return get().codesByOrderId[orderId] ?? null
      },
      saveSecurityCode(orderId, code) {
        set((state) => ({
          codesByOrderId: { ...state.codesByOrderId, [orderId]: code },
        }))
      },
      clearSecurityCode(orderId) {
        set((state) => {
          const nextCodes = { ...state.codesByOrderId }
          delete nextCodes[orderId]
          return { codesByOrderId: nextCodes }
        })
      },
      clearAllSecurityCodes() {
        window.sessionStorage.removeItem(SECURITY_CODE_STORAGE_KEY)
        set({ codesByOrderId: {} })
      },
    }),
    {
      name: SECURITY_CODE_STORAGE_KEY,
      storage: createJSONStorage(() => window.sessionStorage),
    },
  ),
)

export function useSecurityCodes() {
  return useSecurityCodeStore(
    useShallow((state) => ({
      codesByOrderId: state.codesByOrderId,
      getSecurityCode: state.getSecurityCode,
      saveSecurityCode: state.saveSecurityCode,
      clearSecurityCode: state.clearSecurityCode,
      clearAllSecurityCodes: state.clearAllSecurityCodes,
    })),
  )
}
