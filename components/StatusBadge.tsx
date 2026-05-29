import type { RequestStatus } from "@/lib/types";



type StatusBadgeProps = {
  status: RequestStatus;
};

const statusClassNames = {
  Genehmigt: "bg-green-100 text-green-700",
  Ausstehend: "bg-amber-100 text-amber-700",
  Abgelehnt: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusClassNames[status]}`}
    >
      {status}
    </span>
  );
}