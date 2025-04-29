import React from 'react';

export function Textarea({ id, placeholder, value, onChange, rows = 3, className = '' }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    />
  );
}