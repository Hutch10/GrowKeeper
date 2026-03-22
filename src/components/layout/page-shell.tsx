import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark">
          {title}
        </h1>
        {subtitle ? <p className="text-brand-dark/70 font-medium">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
