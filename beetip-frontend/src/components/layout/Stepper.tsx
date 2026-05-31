import { cn } from '../../utils/className'

type StepperStep = {
  label: string
  caption?: string
}

type StepperProps = {
  steps: StepperStep[]
  currentStep?: number
}

export function Stepper({ steps, currentStep = 0 }: StepperProps) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep

        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full font-sans text-xs font-semibold leading-4',
                  isComplete || isCurrent
                    ? 'bg-campus-primary text-campus-on-primary'
                    : 'bg-campus-background text-campus-muted',
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span className="mt-2 h-8 border-l border-dashed border-campus-outline" />
              ) : null}
            </div>

            <div className="min-w-0 pb-1">
              <p className="font-sans text-sm font-semibold leading-5 text-campus-text">
                {step.label}
              </p>
              {step.caption ? (
                <p className="mt-1 font-sans text-sm leading-5 text-campus-muted">
                  {step.caption}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
