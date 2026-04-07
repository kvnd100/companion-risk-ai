import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-xs transition-colors",
        "placeholder:text-neutral-400",
        "focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/5",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:ring-white/5",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
