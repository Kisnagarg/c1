import { forwardRef } from 'react';

const Input = forwardRef(({ 
  className = '', 
  label, 
  error, 
  helperText,
  leftIcon: LeftIcon,
  rightElement,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-xl">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 border transition-colors ${
            LeftIcon ? 'pl-10' : 'pl-4'
          } ${
            rightElement ? 'pr-11' : 'pr-4'
          } ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20' : 'bg-white'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

