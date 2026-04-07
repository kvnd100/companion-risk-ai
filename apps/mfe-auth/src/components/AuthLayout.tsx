import type { ReactNode } from "react";
import { Activity, Shield, Stethoscope } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
  /** Hide the left brand panel (used by splash page which has its own layout) */
  minimal?: boolean;
};

function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <ellipse cx="12" cy="17.5" rx="3.5" ry="3" />
            <circle cx="8.2" cy="11.2" r="1.8" />
            <circle cx="15.8" cy="11.2" r="1.8" />
            <circle cx="6.5" cy="14.8" r="1.6" />
            <circle cx="17.5" cy="14.8" r="1.6" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">PetCare AI</span>
      </div>
    </div>
  );
}

const capabilities = [
  { icon: Activity, text: "AI-powered disease risk prediction" },
  { icon: Shield, text: "Vaccination & health tracking" },
  { icon: Stethoscope, text: "Smart clinic recommendations" },
];

export function AuthLayout({ children, minimal }: AuthLayoutProps) {
  if (minimal) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-neutral-50">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-neutral-950 p-10 text-white">
        <Logo />

        <div className="space-y-6">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
            Companion animal health intelligence
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            A decision-support platform for veterinary teams and pet owners.
            Early risk awareness through AI-driven analysis.
          </p>

          <div className="space-y-3 pt-2">
            {capabilities.map((cap) => (
              <div key={cap.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                  <cap.icon className="h-4 w-4 text-neutral-400" />
                </div>
                <span className="text-[13px] text-neutral-300">{cap.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-600">
          &copy; 2026 PetCare AI &middot; All rights reserved
        </p>
      </div>

      {/* Right content panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 dark:bg-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white dark:fill-neutral-900">
                <ellipse cx="12" cy="17.5" rx="3.5" ry="3" />
                <circle cx="8.2" cy="11.2" r="1.8" />
                <circle cx="15.8" cy="11.2" r="1.8" />
                <circle cx="6.5" cy="14.8" r="1.6" />
                <circle cx="17.5" cy="14.8" r="1.6" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">PetCare AI</span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 items-center justify-center bg-neutral-50 px-5 py-8 sm:px-8 lg:bg-white dark:bg-neutral-950 lg:dark:bg-neutral-950">
          <div className="w-full max-w-[400px] animate-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
