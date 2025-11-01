'use client';

import type { ReactNode } from 'react';

type PageBackgroundProps = {
  children: ReactNode;
  className?: string;
};

const joinClasses = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export const PageBackground = ({ children, className }: PageBackgroundProps) => {
  return (
    <div
      className={joinClasses(
        'relative flex min-h-screen flex-col bg-[#05070f] text-slate-100',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b101f] via-[#141c31] to-[#05070f]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#5060ff]/20 blur-3xl sm:-left-24 sm:top-10 sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-[#23a6d5]/15 blur-3xl sm:-right-20 sm:h-80 sm:w-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10152b]/60 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col">{children}</div>
    </div>
  );
};

export default PageBackground;
