import React from 'react';

export function Input({ id, type = 'text', placeholder, value, onChange, className = '' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    />
  );
}