import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "../../utils/className";

type AppTopBarProps = {
  title: string;
  description?: string;
  backTo?: string;
  isSticky?: boolean;
  topAction?: ReactNode;
  action?: ReactNode;
};

export function AppTopBar({
  title,
  description,
  backTo,
  isSticky = true,
  topAction,
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
    <header
      className={cn(
        "-mx-5 -mt-6 -mb-6 border-campus-outline/60 bg-campus-surface p-5",
        isSticky && "border-b mb-0! sticky top-0 z-20 bg-campus-surface/95 backdrop-blur", 
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {backTo ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-campus-outline bg-campus-card text-lg font-semibold text-campus-primary shadow-card"
            >
              ‹
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-xl font-semibold leading-8 text-campus-text">
              {title}
            </h1>

            {description ? (
              <p className=" font-sans text-xs leading-5 text-campus-muted">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {topAction || action ? (
          <div className="flex shrink-0 items-center gap-2 pt-1">
            {topAction}
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
