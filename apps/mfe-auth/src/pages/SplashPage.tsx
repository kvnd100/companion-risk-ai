import { useNavigate } from "react-router-dom";
import { startSession } from "../lib/session";
import { AuthLayout } from "../components/AuthLayout";
import { FIGMA_PET_HEALTH_TOKENS } from "../config/figma";
import splashHeroImage from "../assets/images/splash-hero.jpg";

/** Matches “Get Started Landing Page” (node `411:37183`) in team library — see `src/config/figma.ts`. */
const BRAND = FIGMA_PET_HEALTH_TOKENS.brand;

function IconSymptom() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2463eb]">
      <path
        d="M12 22s8-4.5 8-11.8V5l-8-3-8 3v5.2C4 17.5 12 22 12 22z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 8v4M10 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWellness() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2463eb]">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16l4-4 4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVet() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2463eb]">
      <path
        d="M12 22s8-4.5 8-11.8V5l-8-3-8 3v5.2C4 17.5 12 22 12 22z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPaw() {
  return (
    <svg width={50} height={48} viewBox="0 0 24 24" fill="white" aria-hidden className="drop-shadow-sm">
      <ellipse cx="12" cy="17.5" rx="3.8" ry="3.2" />
      <circle cx="8" cy="11" r="2.1" />
      <circle cx="16" cy="11" r="2.1" />
      <circle cx="6.2" cy="14.5" r="1.85" />
      <circle cx="17.8" cy="14.5" r="1.85" />
    </svg>
  );
}

function IconMedicalBadge() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#2463eb]">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    title: "Symptom Checker",
    description: "Instant AI-driven clinical analysis",
    icon: <IconSymptom />,
  },
  {
    title: "Wellness Tracking",
    description: "Monitor vital signs and daily activity",
    icon: <IconWellness />,
  },
  {
    title: "Vet Insights",
    description: "Expert-backed preventative data",
    icon: <IconVet />,
  },
];

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout tone="landing" title="PetHealth AI" subtitle="AI-Powered Pet Health Monitoring.">
      <div className="flex min-h-full w-full flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center overflow-hidden px-6 pb-4 pt-12">
          <div className="flex w-full flex-col items-center px-0 pb-8">
            <div className="relative mb-10 flex flex-col items-center">
              <div
                className="relative flex size-24 items-center justify-center rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(36,99,235,0.2),0px_4px_6px_-4px_rgba(36,99,235,0.2)]"
                style={{ backgroundColor: BRAND }}
              >
                <div className="h-[47.5px] w-[50px]">
                  <IconPaw />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#f6f6f8] bg-white p-1 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
                <IconMedicalBadge />
              </div>
            </div>

            <div className="flex max-w-[384px] flex-col gap-4">
              <h1 className="text-center text-[36px] font-bold leading-10 tracking-[-0.9px] text-[#0f172a]">
                PetHealth AI
              </h1>
              <p className="text-center text-[18px] font-normal leading-[29.25px] text-[#475569]">
                AI-Powered Pet Health Monitoring.
                <br />
                Proactive care for your best friend
                <br />
                using advanced diagnostics.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-[448px] flex-col gap-4 pt-2">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex w-full items-center gap-4 rounded-[24px] border border-[rgba(36,99,235,0.1)] bg-white p-[17px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "rgba(36,99,235,0.1)" }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold leading-6 text-[#0f172a]">{item.title}</h2>
                  <p className="text-sm font-normal leading-5 text-[#64748b]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 w-full max-w-[384px] overflow-hidden rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={splashHeroImage}
                alt="Golden retriever portrait"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-[6px] supports-[backdrop-filter]:bg-white/80 bg-white/95 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-8">
          <div className="mx-auto flex w-full max-w-[448px] flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                startSession();
                navigate("/auth/info");
              }}
              className="relative w-full rounded-[24px] py-4 text-center text-lg font-bold leading-7 text-white shadow-[0px_10px_15px_-3px_rgba(36,99,235,0.25),0px_4px_6px_-4px_rgba(36,99,235,0.25)] transition hover:brightness-95 active:brightness-90"
              style={{ backgroundColor: BRAND }}
            >
              Get Started
            </button>
            <p className="text-center text-xs leading-4 text-[#64748b]">
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-[#2463eb] hover:underline"
                onClick={() => navigate("/auth/login")}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
