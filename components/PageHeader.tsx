import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-700">
          {eyebrow}
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="mt-2 text-slate-600">{description}</p>
      </div>

      {action ? <div>{action}</div> : null}
    </header>
  );
}