import React from 'react';

const variantClasses = {
    default: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border border-gray-300 text-black hover:bg-gray-100',
    ghost: 'bg-transparent text-black hover:bg-gray-100',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    link: 'underline text-blue-600 hover:text-blue-800',
  };


const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8 text-lg',
    icon: 'h-10 w-10',
  };

const baseClasses = `
  inline-flex items-center justify-center rounded-md 
  font-medium transition-colors focus:outline-none 
  focus:ring-2 focus:ring-offset-2 disabled:opacity-50 
  disabled:pointer-events-none
`;

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  const variantClass = variantClasses[variant] || variantClasses.default;
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <Comp
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export { Button };