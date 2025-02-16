'use client';

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-50',
  icon: 'p-2',
};

const sizes = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1 text-sm',
  lg: 'px-6 py-3',
  icon: 'p-2',
};

export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
