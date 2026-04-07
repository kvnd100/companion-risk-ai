import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { markOnboardingSeen, hasStartedSession, hasSeenInfoStep, markOnboardingStepDone } from "../lib/session";
import { ArrowLeft, ArrowRight, Brain, MapPin, Syringe } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

const slides = [
  {
    title: "AI Risk Prediction",
    description: "Machine learning models analyze symptoms against a veterinary knowledge graph to surface potential health risks with explainable confidence scores.",
    icon: Brain,
  },
  {
    title: "Clinic Discovery",
    description: "Location-aware recommendations connect you with qualified veterinary clinics based on your pet's condition, proximity, and availability.",
    icon: MapPin,
  },
  {
    title: "Health Timeline",
    description: "A complete digital record of vaccinations, checkups, and preventive care with intelligent reminders for upcoming boosters and appointments.",
    icon: Syringe,
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  if (!hasStartedSession()) return <Navigate to="/auth" replace />;
  if (!hasSeenInfoStep()) return <Navigate to="/auth/info" replace />;

  const slide = slides[step];
  const isLast = step === slides.length - 1;
  const progressValue = 33 + ((step + 1) / slides.length) * 33;

  function finish() {
    markOnboardingStepDone();
    markOnboardingSeen();
    navigate("/auth/role");
  }

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Step 2 of 3</span>
            <button type="button" onClick={finish} className="font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Skip
            </button>
          </div>
          <Progress value={progressValue} />
        </div>

        {/* Slide content */}
        <div className="min-h-[200px]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
            <slide.icon className="h-5 w-5 text-neutral-600" />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            {slide.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {slide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="mt-6 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-6 bg-neutral-900" : "w-1.5 bg-neutral-200 hover:bg-neutral-300",
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-2">
          {step > 0 && (
            <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} className="w-10 px-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={() => isLast ? finish() : setStep((s) => s + 1)}>
            {isLast ? "Continue" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
