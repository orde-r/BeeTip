import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

type AppTopBarProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  backTo?: string;
  action?: ReactNode;
};

export function AppTopBar({
  title,
  eyebrow = "BeeTip",
  description,
  backTo,
  action,
}: AppTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleBack() {
    if (!backTo) {
      return;
    }

    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(backTo);
  }

  return (
    <header className="space-y-2">
      <div className="flex min-h-10 items-center justify-between gap-2 mb-5">
        {backTo ? (
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-campus-outline bg-campus-card text-lg font-semibold text-campus-primary shadow-card"
          > 
            ‹
          </button>
        ) : (
          <p className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary">
            {eyebrow}
          </p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold leading-8 text-campus-text">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 font-sans text-sm leading-5 text-campus-muted">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </header>
  );
}
