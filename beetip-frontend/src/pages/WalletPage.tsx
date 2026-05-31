import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { PrimaryActionButton } from '../components/actions/ActionButton'
import { FormField } from '../components/auth/FormField'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { BalanceSummary } from '../components/wallet/BalanceSummary'
import { TransactionList } from '../components/wallet/TransactionList'
import { ApiClientError } from '../services/apiClient'
import { deposit, getHistory } from '../services/transactionsApi'
import { useAuth } from '../state/AuthContext'
import type { TransactionDTO } from '../types/api'
import { formatRupiahInput, parseRupiahInput } from '../utils/format'

export function WalletPage() {
  const { refreshUser, updateUser, user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionDTO[]>([])
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [depositError, setDepositError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDepositing, setIsDepositing] = useState(false)

  const loadWallet = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [, historyResponse] = await Promise.all([
        refreshUser(),
        getHistory(),
      ])

      setTransactions(historyResponse.transactions)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load wallet details.'))
    } finally {
      setIsLoading(false)
    }
  }, [refreshUser])

  useEffect(() => {
    void Promise.resolve().then(loadWallet)
  }, [loadWallet])

  async function handleDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = parseRupiahInput(amount)

    if (parsedAmount === null || parsedAmount <= 0) {
      setAmountError('Enter a positive top-up amount.')
      return
    }

    setIsDepositing(true)
    setAmountError('')
    setDepositError('')

    try {
      const response = await deposit({ amount: parsedAmount })
      const currentUser = user ?? (await refreshUser())

      if (currentUser) {
        updateUser((authenticatedUser) => ({
          ...authenticatedUser,
          balance: response.new_balance,
        }))
      }

      setTransactions((currentTransactions) => [
        response.transaction,
        ...currentTransactions,
      ])
      setAmount('')
    } catch (error) {
      setDepositError(getErrorMessage(error, 'Unable to top up wallet.'))
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <PageShell
      title="Wallet"
      description="Track balance, top up, and review every wallet movement."
      action={null}
    >
      {isLoading ? <Notice>Loading wallet.</Notice> : null}

      {loadError ? (
        <Notice tone="error">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadWallet}
            className="mt-3 block font-sans text-sm font-semibold leading-5 text-campus-primary"
          >
            Try again
          </button>
        </Notice>
      ) : null}

      <BalanceSummary
        balance={user?.balance ?? 0}
        caption="Used for buyer payments and kurir earnings."
      />

      <SurfaceCard>
        <form className="grid gap-4" onSubmit={handleDeposit} noValidate>
          <div>
            <h2 className="font-heading text-xl font-semibold leading-7 text-campus-text">
              Top up
            </h2>
            <p className="font-sans text-sm leading-5 text-campus-muted">
              Add mock wallet balance for campus requests.
            </p>
          </div>

          <FormField
            id="deposit_amount"
            name="deposit_amount"
            label="Amount"
            placeholder="Rp 50.000"
            inputMode="numeric"
            value={amount}
            onChange={(event) => {
              setAmount(formatRupiahInput(event.target.value))
              setAmountError('')
            }}
            error={amountError}
            disabled={isDepositing}
          />

          {depositError ? <Notice tone="error">{depositError}</Notice> : null}

          <PrimaryActionButton type="submit" disabled={isDepositing}>
            {isDepositing ? 'Adding balance...' : 'Top up wallet'}
          </PrimaryActionButton>
        </form>
      </SurfaceCard>

      <TransactionList transactions={transactions} />
      <VelocityBottomNav />
    </PageShell>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback
}
