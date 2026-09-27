"use client";

import React from "react";

export function Field({
  label,
  optional,
  children,
  hint,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-ink">
        {label}
        {optional ? <span className="text-xs font-normal text-muted">(opcional)</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const baseInputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`${baseInputClass} ${className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`${baseInputClass} resize-y ${className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={`${baseInputClass} ${className ?? ""}`}>
      {children}
    </select>
  );
}

export function GuidanceNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-border bg-paper px-3 py-2 text-xs leading-relaxed text-muted">
      {children}
    </p>
  );
}
