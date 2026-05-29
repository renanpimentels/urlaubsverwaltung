type StatCardProps = {
  title: string;
  value: string;
  description: string;
  variant?: "default" | "warning";
};

export function StatCard({
  title,
  value,
  description,
  variant = "default",
}: StatCardProps) {
  const valueClassName =
    variant === "warning" ? "mt-3 block text-4xl text-amber-600" : "mt-3 block text-4xl";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <strong className={valueClassName}>{value}</strong>
      <span className="text-sm text-slate-500">{description}</span>
    </article>
  );
}