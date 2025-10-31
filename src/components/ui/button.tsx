'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  destructive:
    'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600',
};

const sizeClasses = {
  small: 'px-3 py-2 text-sm',
  medium: 'px-4 py-3 text-base',
  large: 'px-6 py-4 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}

      {children}

      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}

// Icon Button variant
export function IconButton({
  children,
  size = 'medium',
  className = '',
  ...props
}: Omit<ButtonProps, 'variant' | 'iconPosition'>) {
  const sizeClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  };

  return (
    <Button
      variant="tertiary"
      size={size}
      className={`${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

// Floating Action Button
export function FloatingActionButton({
  children,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant' | 'size'>) {
  return (
    <Button
      variant="primary"
      size="large"
      className={`fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl z-50 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
