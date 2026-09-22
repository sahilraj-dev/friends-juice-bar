'use client';

import React, { useState, useEffect, ReactNode, InputHTMLAttributes } from 'react';
import { Loader2, X, Star } from 'lucide-react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      primary: 'bg-brand-500 text-white hover:bg-orange-600',
      secondary: 'bg-orange-100 text-brand-600 hover:bg-orange-200',
      outline: 'border-2 border-brand-500 text-brand-600 hover:bg-orange-50',
      ghost: 'hover:bg-gray-100 text-gray-700',
      danger: 'bg-red-500 text-white hover:bg-red-600'
    };
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg'
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconPrefix?: ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, iconPrefix, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
          {iconPrefix && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{iconPrefix}</div>}
          <input
            ref={ref}
            className={`block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:ring-brand-500 sm:text-sm outline-none border ${iconPrefix ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Skeleton
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// Badge
export const Badge = ({ children, variant = 'brand', className = '' }: { children: ReactNode, variant?: 'brand' | 'success' | 'danger' | 'gray', className?: string }) => {
  const variants = {
    brand: 'bg-brand-500 text-white',
    success: 'bg-fresh-500 text-white',
    danger: 'bg-red-500 text-white',
    gray: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// QuantitySelector
export const QuantitySelector = ({ value, onChange, min = 1, max = 99, className = '' }: { value: number, onChange: (val: number) => void, min?: number, max?: number, className?: string }) => {
  return (
    <div className={`flex items-center space-x-3 bg-gray-100 rounded-full px-2 py-1 ${className}`}>
      <button onClick={() => value > min && onChange(value - 1)} disabled={value <= min} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-600 disabled:opacity-50 disabled:shadow-none">-</button>
      <span className="font-semibold text-gray-900 w-4 text-center">{value}</span>
      <button onClick={() => value < max && onChange(value + 1)} disabled={value >= max} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-brand-600 disabled:opacity-50 disabled:shadow-none">+</button>
    </div>
  );
};

// RatingStars
export const RatingStars = ({ rating, onChange, readOnly = false, size = 16 }: { rating: number, onChange?: (val: number) => void, readOnly?: boolean, size?: number }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${readOnly ? '' : 'cursor-pointer hover:scale-110 transition-transform'}`}
          onClick={() => !readOnly && onChange?.(star)}
        />
      ))}
    </div>
  );
};

// EmptyState
export const EmptyState = ({ icon, title, description, action }: { icon: ReactNode, title: string, description: string, action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="bg-gray-50 rounded-full p-6 mb-4 text-gray-400">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
    {action}
  </div>
);

// Modal
export const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: ReactNode, title?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// BottomSheet
export const BottomSheet = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: ReactNode }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom duration-300">
        <div className="w-full flex justify-center py-3" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="pb-safe">
          {children}
        </div>
      </div>
    </>
  );
};
