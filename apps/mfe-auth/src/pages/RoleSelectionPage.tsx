import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { saveSelectedRole, hasStartedSession, hasCompletedOnboardingStep, markRoleStepDone } from "../lib/session";
import { PawPrint, Stethoscope, Settings, Check, ArrowRight } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

const roles = [
  {
    id: "pet-owner",
    title: "Pet Owner",
    description: "Track health records, get AI risk assessments, and find clinics",
    icon: PawPrint,
  },
  {
    id: "veterinarian",
    title: "Veterinarian",
    description: "Manage patients, view histories, and respond to care inquiries",
    icon: Stethoscope,
  },
  {
    id: "admin",
    title: "Platform Admin",
    description: "System oversight, clinic approvals, and user management",
    icon: Settings,
  },
];

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("pet-owner");
  if (!hasStartedSession()) return <Navigate to="/auth" replace />;
  if (!hasCompletedOnboardingStep()) return <Navigate to="/auth/onboarding" replace />;

  function handleContinue() {
    saveSelectedRole(selectedRole);
    markRoleStepDone();
    navigate("/auth/login");
  }

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Step 3 of 3</span>
            <span className="font-medium text-neutral-600">Almost done</span>
          </div>
          <Progress value={100} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Select your role
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          This determines your dashboard and available features.
        </p>

        <div className="mt-6 space-y-2">
          {roles.map((role) => {
            const active = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150",
                  active
                    ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                    : "border-neutral-200 bg-white hover:border-neutral-300",
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500",
                )}>
                  <role.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{role.title}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{role.description}</p>
                </div>
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all",
                  active ? "bg-neutral-900 text-white" : "border border-neutral-300",
                )}>
                  {active && <Check className="h-3 w-3" />}
                </div>
              </button>
            );
          })}
        </div>

        <Button size="xl" className="mt-8 w-full" onClick={handleContinue}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="mt-4 text-center text-xs text-neutral-400">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/auth/login")} className="font-medium text-neutral-900 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
