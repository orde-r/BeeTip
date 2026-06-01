import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { AppTopBar } from "./AppTopBar";
import { MobileScreenFrame } from "./MobileScreenFrame";

type PageShellProps = {
  title: string;
  description?: string;
  backTo?: string;
  isTopBarSticky?: boolean;
  topAction?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
};

export function PageShell({
  title,
  description,
  backTo,
  isTopBarSticky = true,
  topAction,
  action,
  children,
}: PageShellProps) {
  return (
    <MobileScreenFrame>
      <AppTopBar
        title={title}
        description={description}
        backTo={backTo}
        isSticky={isTopBarSticky}
        topAction={topAction}
        action={
          action !== undefined ? (
            action
          ) : (
            <Link
              className="font-sans text-xs font-semibold uppercase leading-4 tracking-wider text-campus-primary"
              to="/profile"
            >
              Profile
            </Link>
          )
        }
      />

      <div className="mt-6 flex flex-1 flex-col gap-5">{children}</div>
    </MobileScreenFrame>
  );
}
