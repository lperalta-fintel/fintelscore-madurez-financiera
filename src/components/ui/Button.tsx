import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  pulse = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed will-change-transform";

  const variants = {
    primary: "bg-gradient-to-r from-fintel-cyan to-fintel-blue-medium text-white hover:shadow-neon-cyan focus:ring-fintel-cyan",
    secondary: "bg-gradient-to-r from-fintel-green to-fintel-green-light text-fintel-blue-dark hover:shadow-neon-green focus:ring-fintel-green",
    ghost: "bg-fintel-border-light/50 text-fintel-text-primary border border-fintel-border-light hover:bg-fintel-border-light focus:ring-fintel-gray"
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg"
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {pulse && !disabled ? (
        <span className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-xl bg-current opacity-20 animate-ping" />
          <span className="relative">{children}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
