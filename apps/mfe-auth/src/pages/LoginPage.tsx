import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser } from "../lib/auth-api";
import { toast } from "../lib/use-toast";
import {
  getAccessToken, saveAccessToken, verifyAndSaveRole, saveUserCredentials,
  getSelectedRole, saveProfileName, getRegisteredRoleForEmail, getVerifiedRole,
} from "../lib/session";
import { AuthLayout } from "../components/AuthLayout";
import { redirectToPets } from "../lib/post-auth-redirect";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Alert } from "../components/ui/alert";
import { AlertTriangle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLE_LABELS: Record<string, string> = {
  "pet-owner": "Pet Owner",
  "veterinarian": "Veterinarian",
  "admin": "Admin",
};

export function LoginPage() {
  const navigate = useNavigate();
  const selectedRole = getSelectedRole() || "pet-owner";
  const verifiedRole = getVerifiedRole();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (getAccessToken()) {
    const activeRole = verifiedRole || selectedRole;
    const path = activeRole === "veterinarian" ? "/vet-dashboard" : activeRole === "admin" ? "/admin-dashboard" : "/pets";
    return <Navigate to={path} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const expectedRole = getRegisteredRoleForEmail(values.email);
      if (expectedRole && expectedRole !== selectedRole) {
        setErrorMessage(`This account is registered as ${ROLE_LABELS[expectedRole] ?? expectedRole}. Select that role to continue.`);
        return;
      }

      const { token, displayName } = await loginUser({ email: values.email, password: values.password });

      if (!getRegisteredRoleForEmail(values.email)) {
        saveUserCredentials(values.email, selectedRole);
      }
      verifyAndSaveRole(values.email, selectedRole);
      saveProfileName(displayName || values.email.split("@")[0], selectedRole);
      saveAccessToken(token);

      toast({ title: "Signed in", variant: "success" });
      redirectToPets(navigate);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your credentials to continue
            </p>
          </div>
          <button type="button" onClick={() => navigate("/auth/role")}>
            <Badge variant="outline" className="cursor-pointer hover:bg-neutral-50">
              {ROLE_LABELS[selectedRole] ?? selectedRole}
            </Badge>
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/auth/forgot-password" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter password"
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
          </div>

          {errorMessage && (
            <Alert variant="danger" className="animate-slide-up">
              <AlertTriangle />
              <span>{errorMessage}</span>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in"}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 px-3 text-xs text-neutral-400 lg:bg-white">
            or
          </span>
        </div>

        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link to="/auth/register" className="font-medium text-neutral-900 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
