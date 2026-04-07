import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, AlertTriangle } from "lucide-react";
import { registerUser } from "../lib/auth-api";
import { toast } from "../lib/use-toast";
import { getAccessToken, getSelectedRole, saveUserCredentials, saveProfileName } from "../lib/session";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";
import { cn } from "../lib/utils";

const registerSchema = z.object({
  displayName: z.string().min(2, "At least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z.string().trim().regex(/^\d{10}$/, "Must be exactly 10 digits"),
  password: z.string().min(9, "At least 9 characters"),
  confirmPassword: z.string().min(9, "Confirm your password"),
  role: z.enum(["pet-owner", "veterinarian", "admin"]),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const savedRole = getSelectedRole();
  const defaultRole: "pet-owner" | "veterinarian" | "admin" =
    savedRole === "veterinarian" || savedRole === "admin" || savedRole === "pet-owner" ? savedRole : "pet-owner";

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  if (getAccessToken()) return <Navigate to="/pets" replace />;

  const password = watch("password", "");
  const checks = [
    { label: "9+ characters", ok: password.length >= 9 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;

  const onSubmit = handleSubmit(async (values) => {
    if (!agreedToTerms) {
      setErrorMessage("Please agree to the terms to continue.");
      return;
    }
    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      await registerUser({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        phoneNumber: values.phoneNumber,
        role: values.role,
      });
      saveUserCredentials(values.email, values.role);
      saveProfileName(values.displayName, values.role);
      toast({ title: "Account created", description: "Sign in to continue.", variant: "success" });
      navigate("/auth/login", { replace: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Registration failed";
      setErrorMessage(msg === "role_already_assigned_for_email" ? "This email is registered with a different role." : msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Create account</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-neutral-900 hover:underline">Sign in</Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Full name</Label>
            <Input {...register("displayName")} id="displayName" autoComplete="name" placeholder="Jane Doe" />
            {errors.displayName && <p className="text-xs text-red-600">{errors.displayName.message}</p>}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              {...register("role")}
              id="role"
              className="flex h-9 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-xs transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
              onChange={(e) => localStorage.setItem("companion_ai_selected_role", e.target.value)}
            >
              <option value="pet-owner">Pet Owner</option>
              <option value="veterinarian">Veterinarian</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input {...register("email")} id="email" type="email" autoComplete="email" placeholder="you@company.com" />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              {...register("phoneNumber")}
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={10}
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); }}
              placeholder="0712345678"
            />
            {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}

            {password.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-0.5 flex-1 rounded-full transition-all", i <= strength ? "bg-neutral-900" : "bg-neutral-200")} />
                  ))}
                </div>
                <div className="flex gap-3">
                  {checks.map((c) => (
                    <span key={c.label} className={cn("inline-flex items-center gap-1 text-[11px]", c.ok ? "text-neutral-700" : "text-neutral-300")}>
                      <Check className={cn("h-2.5 w-2.5", c.ok ? "opacity-100" : "opacity-0")} />
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input {...register("confirmPassword")} id="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter password" />
            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950"
            />
            <span className="text-xs leading-relaxed text-neutral-500">
              I agree to the <span className="text-neutral-900">Terms of Service</span> and <span className="text-neutral-900">Privacy Policy</span>
            </span>
          </label>

          {errorMessage && (
            <Alert variant="danger" className="animate-slide-up">
              <AlertTriangle />
              <span>{errorMessage}</span>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !agreedToTerms}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create account"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
