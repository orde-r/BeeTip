import { useMemo } from 'react'
import type { OrderDTO } from '../types/api'
import { parseOrderDescription } from '../utils/orderDisplay'

export function useParsedOrder(order: OrderDTO | null) {
  const itemDescription = order?.item_desc

  return useMemo(
    () => (itemDescription ? parseOrderDescription(itemDescription) : null),
    [itemDescription],
  )
}
