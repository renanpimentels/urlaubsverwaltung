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
    variant === "warning"
      ? "text-amber-700"
      : "text-slate-950";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <strong
        className={`mt-2 block text-3xl font-bold tracking-tight ${valueClassName}`}
      >
        {value}
      </strong>

      <span className="mt-1 block text-sm text-slate-500">{description}</span>
    </article>
  );
}