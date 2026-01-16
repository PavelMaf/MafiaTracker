import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export const PrimaryButton = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`min-h-[44px] rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 ${className}`}
  />
);

export const SecondaryButton = ({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`min-h-[44px] rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-accent ${className}`}
  />
);

export const TextInput = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none ${className}`}
  />
);

export const Card = ({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow ${className}`}>
    {title && <h2 className="mb-3 text-base font-semibold">{title}</h2>}
    {children}
  </section>
);
