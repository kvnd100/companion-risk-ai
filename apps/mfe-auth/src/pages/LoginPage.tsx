import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../lib/auth-api";
import { getAccessToken, saveAccessToken, verifyAndSaveRole, getSelectedRole, saveProfileName, getRegisteredRoleForEmail, getVerifiedRole } from "../lib/session";
import { AuthLayout } from "../components/AuthLayout";
import { redirectToPets } from "../lib/post-auth-redirect";
import authVetConsultImage from "../assets/images/auth-vet-consult.jpg";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const selectedRole = getSelectedRole() || "pet-owner";
  const verifiedRole = getVerifiedRole();
  const roleLabel = selectedRole === "pet-owner" ? "Pet Owner" : selectedRole === "veterinarian" ? "Veterinarian" : "Admin";

  if (getAccessToken()) {
    const activeRole = verifiedRole || selectedRole;
    const dashboardPath = activeRole === "veterinarian"
      ? "/vet-dashboard"
      : activeRole === "admin"
        ? "/admin-dashboard"
        : "/pets";
    return <Navigate to={dashboardPath} replace />;
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      // Check local role mapping
      const expectedRole = getRegisteredRoleForEmail(values.email);
      if (expectedRole && expectedRole !== selectedRole) {
        const label = expectedRole === "pet-owner" ? "Pet Owner" : expectedRole === "veterinarian" ? "Veterinarian" : "Admin";
        setErrorMessage(`This account is registered as ${label}. Please choose that role to login.`);
        setIsSubmitting(false);
        return;
      }

      // Authenticate with backend
      const { token, displayName } = await loginUser({
        email: values.email,
        password: values.password,
      });

      verifyAndSaveRole(values.email, selectedRole);
      saveProfileName(displayName || values.email.split("@")[0], selectedRole);
      saveAccessToken(token);
      redirectToPets(navigate);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Login failed";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout title="Welcome Back" subtitle="Secure login for pet owners, veterinarians, and administrators.">
      <div className="flex flex-1 flex-col">
        <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <button type="button" onClick={() => navigate("/auth/role")} className="text-4xl text-slate-800">&larr;</button>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sign In</h1>
          <span className="w-6"></span>
        </header>

        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img
            src={authVetConsultImage}
            alt="Vet consulting pet owner"
            className="h-72 w-full object-cover"
          />
          <div className="px-5 pb-5 pt-4 text-center">
            <h2 className="text-6xl font-extrabold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-[18px] leading-8 text-slate-600">Log in to monitor your pet's health with AI</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Role: {roleLabel}
              <button
                type="button"
                onClick={() => navigate("/auth/role")}
                className="text-xs underline underline-offset-2"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <form key={selectedRole} onSubmit={onSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="auth-label text-[18px]">Email Address</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="auth-input"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="auth-label text-[18px]">Password</label>
              <Link to="/auth/forgot-password" className="text-[18px] font-semibold text-blue-600">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="auth-input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center gap-2 py-1 text-[18px]">
            <input type="checkbox" className="h-6 w-6 rounded border-slate-300" />
            <label className="text-slate-700">Remember this device</label>
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-primary-btn mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-lg text-slate-600">
          Don&apos;t have an account? <Link to="/auth/register" className="font-semibold text-blue-600">Create Account</Link>
        </p>

        <div className="mt-8 pb-2 text-center text-sm text-slate-400">
          <p>Privacy Policy  &middot;  Terms of Service  &middot;  Help Center</p>
          <p className="mt-2">&copy; 2026 PetHealth AI. All rights reserved.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
