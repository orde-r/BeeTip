import { PrimaryActionButton } from '../components/actions/ActionButton'
import { Notice } from '../components/layout/Notice'
import { PageShell } from '../components/layout/PageShell'
import { SurfaceCard } from '../components/layout/SurfaceCard'
import { Stepper } from '../components/layout/Stepper'
import { routes } from '../app/routes'
import heroImage from '../assets/hero.png'

export function OnboardingPage() {
  return (
    <PageShell
      title="BeeTip"
      description="Campus errands, handed off by nearby students."
      action={null}
    >
      <SurfaceCard className="overflow-hidden p-0">
        <div className="bg-campus-primary-fixed px-6 pt-7">
          <img
            src={heroImage}
            alt=""
            className="mx-auto h-40 w-40 object-contain"
          />
        </div>
        <div className="grid gap-2 p-4">
          <p className="font-heading text-xl font-semibold leading-7 text-campus-text">
            Move faster across campus
          </p>
          <p className="font-sans text-sm leading-5 text-campus-muted">
            Request food and supplies, chat with a kurir, and confirm handoff
            with a one-time security code.
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <Stepper
          currentStep={0}
          steps={[
            {
              label: 'Request from campus spots',
              caption: 'Tell a kurir what to buy and where to bring it.',
            },
            {
              label: 'Chat and confirm the price',
              caption: 'Review the item price before paying from your wallet.',
            },
            {
              label: 'Complete with a security code',
              caption: 'Share the code only when the item is in your hands.',
            },
          ]}
        />
      </SurfaceCard>
      <Notice>
        Use Buyer Home to create requests and Kurir Home to accept deliveries.
      </Notice>
      <PrimaryActionButton to={routes.auth} className="mt-auto">
        Get started
      </PrimaryActionButton>
    </PageShell>
  )
}
