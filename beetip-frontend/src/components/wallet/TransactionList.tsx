import { SurfaceCard } from '../layout/SurfaceCard'
import type { TransactionDTO } from '../../types/api'
import { formatDateTime, formatRupiah } from '../../utils/format'
import { cn } from '../../utils/className'

type TransactionListProps = {
  transactions: TransactionDTO[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <SurfaceCard>
        <p className="font-sans text-sm leading-5 text-campus-muted">
          No wallet activity yet. Top up to start placing requests.
        </p>
      </SurfaceCard>
    )
  }

  return (
    <section className="grid gap-3">
      <div>
        <h2 className="font-heading text-xl font-semibold leading-7 text-campus-text">
          Activity
        </h2>
        <p className="font-sans text-sm leading-5 text-campus-muted">
          Deposits, payments, and delivery earnings.
        </p>
      </div>

      <div className="grid gap-3">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </section>
  )
}

function TransactionRow({ transaction }: { transaction: TransactionDTO }) {
  const isNegative = transaction.type === 'PAYMENT'
  const amountPrefix = isNegative ? '-' : '+'

  return (
    <SurfaceCard className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-sans text-sm font-semibold leading-5 text-campus-text">
          {formatTransactionType(transaction.type)}
        </p>
        <p className="mt-1 font-sans text-xs leading-4 text-campus-muted">
          {formatDateTime(transaction.createdAt)}
        </p>
      </div>
      <p
        className={cn(
          'shrink-0 font-sans text-sm font-semibold leading-5',
          isNegative ? 'text-campus-error' : 'text-campus-success',
        )}
      >
        {amountPrefix}
        {formatRupiah(transaction.amount)}
      </p>
    </SurfaceCard>
  )
}

function formatTransactionType(type: TransactionDTO['type']) {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
