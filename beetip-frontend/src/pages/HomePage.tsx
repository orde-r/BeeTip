import { useState } from 'react'
import { routes } from '../app/routes'
import { PrimaryActionButton } from '../components/actions/ActionButton'
import { PageShell } from '../components/layout/PageShell'
import { VelocityBottomNav } from '../components/layout/VelocityBottomNav'
import { cn } from '../utils/className'
import { BuyerHomeContent } from './BuyerHomePage'
import { KurirHomeContent } from './KurirHomePage'

type HomeMode = 'buyer' | 'kurir'

type HomePageProps = {
  defaultMode?: HomeMode
}

const modeCopy = {
  buyer: {
    title: 'Home',
    description: 'Create requests and track your campus deliveries.',
  },
  kurir: {
    title: 'Home',
    description: 'Find available requests and track active deliveries.',
  },
} satisfies Record<HomeMode, { title: string; description: string }>

export function HomePage({ defaultMode = 'buyer' }: HomePageProps) {
  const [mode, setMode] = useState<HomeMode>(defaultMode)
  const copy = modeCopy[mode]

  return (
    <PageShell
      title={copy.title}
      description={copy.description}
      isTopBarSticky={false}
      topAction={<HomeModeToggle mode={mode} onChange={setMode} />}
      action={null}
    >
      <div className="flex flex-1 flex-col gap-5 pb-12">
        {mode === 'buyer' ? (
          <BuyerHomeContent showInlineAction={false} />
        ) : (
          <KurirHomeContent showInlineAction={false} />
        )}
      </div>
      <FloatingHomeAction mode={mode} />
      <VelocityBottomNav />
    </PageShell>
  )
}

function HomeModeToggle({
  mode,
  onChange,
}: {
  mode: HomeMode
  onChange: (mode: HomeMode) => void
}) {
  return (
    <div
      aria-label="Home mode"
      className="grid grid-cols-2 rounded-2xl border border-campus-outline bg-campus-card p-1 shadow-card"
      role="tablist"
    >
      <ModeButton
        isSelected={mode === 'buyer'}
        label="Buyer"
        onClick={() => onChange('buyer')}
      />
      <ModeButton
        isSelected={mode === 'kurir'}
        label="Kurir"
        onClick={() => onChange('kurir')}
      />
    </div>
  )
}

function FloatingHomeAction({ mode }: { mode: HomeMode }) {
  const isBuyerMode = mode === 'buyer'

  return (
    <div className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-1/2 z-20 w-full -translate-x-1/2 px-5 sm:max-w-mobile">
      <PrimaryActionButton
        to={isBuyerMode ? routes.createOrder : routes.kurirOrders}
        className="min-h-14 rounded-2xl px-5 py-4 text-left text-base shadow-floating"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <span className="min-w-0 flex-1 text-md">
            {isBuyerMode ? 'Create new order' : 'Accept new order'}
          </span>
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-campus-on-primary/20 text-xl leading-none">
            +
          </span>
        </div>
      </PrimaryActionButton>
    </div>
  )
}

function ModeButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-selected={isSelected}
      className={cn(
        'min-h-9 rounded-xl px-3 font-sans text-xs font-semibold leading-4 transition',
        isSelected
          ? 'bg-campus-primary-fixed text-campus-primary-fixed-text'
          : 'text-campus-muted',
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  )
}
