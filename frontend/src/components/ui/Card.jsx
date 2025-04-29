import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg border bg-card shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}