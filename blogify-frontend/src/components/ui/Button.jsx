import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:opacity-90",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  const sizes = {
    default: "h-12 px-6 py-2",
    sm: "h-10 rounded-md px-3",
    lg: "h-14 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = "Button";
