"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded font-display uppercase tracking-[0.15em] text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:brightness-110 shadow-sm",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline: "border border-border bg-transparent text-foreground hover:bg-muted/30 hover:text-primary",
      secondary: "border-2 border-primary bg-transparent text-primary hover:border-secondary hover:bg-secondary hover:text-foreground",
      ghost: "text-primary hover:text-[#D4B872] hover:underline underline-offset-4",
      link: "text-primary underline-offset-4 hover:underline",
      premium: "bg-brass text-[#1C1714] font-bold shadow-brass hover:brightness-110 active:scale-[0.97] text-engraved border-0"
    };

    const sizes = {
      default: "h-12 px-8",
      sm: "h-10 px-6",
      lg: "h-14 px-10",
      icon: "h-10 w-10 p-0",
    };

    const buttonClass = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild) {
      return <Comp className={buttonClass} ref={ref} {...props} />;
    }

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={buttonClass}
        ref={ref}
        {...(props as any)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
