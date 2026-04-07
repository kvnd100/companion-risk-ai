import { useNavigate } from "react-router-dom";
import { startSession } from "../lib/session";
import { Activity, Shield, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import splashHeroImage from "../assets/images/splash-hero.jpg";

const features = [
  { icon: Activity, title: "AI Risk Analysis", desc: "Early disease detection with confidence scoring" },
  { icon: Shield, title: "Health Tracking", desc: "Vaccination records and wellness timeline" },
  { icon: Stethoscope, title: "Clinic Network", desc: "Find qualified veterinary care nearby" },
];

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left — visual panel */}
      <div className="relative flex flex-col justify-end bg-neutral-950 p-6 pb-10 text-white lg:w-1/2 lg:p-12">
        <img
          src={splashHeroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-2.5">
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

          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
            Companion animal health intelligence
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            AI-driven decision support for early disease risk awareness.
            Built for veterinary teams and pet owners.
          </p>

          <div className="mt-8 hidden gap-6 lg:flex">
            {features.map((f) => (
              <div key={f.title} className="flex-1">
                <f.icon className="mb-2 h-4 w-4 text-neutral-500" />
                <p className="text-[13px] font-medium text-neutral-300">{f.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — CTA */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile features */}
          <div className="mb-10 space-y-4 lg:hidden">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <f.icon className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{f.title}</p>
                  <p className="text-xs text-neutral-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Get started</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Set up your account in under a minute.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              size="xl"
              className="w-full"
              onClick={() => { startSession(); navigate("/auth/info"); }}
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="xl"
              className="w-full"
              onClick={() => navigate("/auth/login")}
            >
              Sign in to existing account
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-neutral-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
