import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../components/AuthLayout";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:4000";
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process request");
      }

      setEmailSent(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <AuthLayout title="Reset Password" subtitle="We'll help you reset your password.">
      <div className="flex flex-1 flex-col">
        <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <button type="button" onClick={() => navigate("/auth/login")} className="text-4xl text-slate-800">&larr;</button>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <span className="w-6"></span>
        </header>

        <div className="pwa-card p-6">
          {emailSent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
              <p className="mt-3 text-[18px] leading-8 text-slate-600">
                If an account exists for <span className="font-semibold text-slate-800">{getValues("email")}</span>, we've sent password reset instructions.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="auth-secondary-btn mt-6"
              >
                Try another email
              </button>
              <Link
                to="/auth/login"
                className="mt-3 block text-center text-[18px] font-semibold text-blue-600"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Forgot your password?</h2>
                <p className="mt-2 text-[18px] leading-8 text-slate-600">
                  Enter the email address you registered with and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="auth-label text-[18px]">Email Address</label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    className="auth-input"
                    placeholder="name@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-primary-btn"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-center text-lg text-slate-600">
                Remember your password? <Link to="/auth/login" className="font-semibold text-blue-600">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
