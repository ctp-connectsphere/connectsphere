import React from 'react';

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const GlowingButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button',
  href,
  disabled = false,
  loading = false
}: GlowingButtonProps) => {
  const baseStyle = "relative px-6 py-3 rounded-xl font-bold transition-all duration-300 overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    outline: "bg-transparent border border-indigo-400/50 text-indigo-300 hover:border-indigo-400 hover:text-white"
  };

  const buttonContent = (
    <>
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-transform duration-500 ease-out opacity-100" />
      )}
    </>
  );

  const buttonClasses = `${baseStyle} ${variants[variant]} ${className} ${href ? 'inline-block' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`;

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={buttonClasses}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
};

