// src/components/ui/BasicComponents.tsx

import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${props.className || ''}`}>
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`px-3 py-2 border rounded ${props.className || ''}`} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`px-3 py-2 border rounded ${props.className || ''}`} />
);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded">
        {children}
        <button onClick={() => onOpenChange(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="mb-4">{children}</div>;
export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-xl font-bold">{children}</h2>;
export const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="mt-4">{children}</div>;