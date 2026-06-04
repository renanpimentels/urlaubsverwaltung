import type { RequestStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: RequestStatus;
  approvalStepsCompleted?: number;
  approvalStepsRequired?: number;
};

const statusStyles: Record<RequestStatus, string> = {
  Genehmigt: "bg-green-100 text-green-700",
  Ausstehend: "bg-amber-100 text-amber-700",
  Abgelehnt: "bg-red-100 text-red-700",
  Storniert: "bg-slate-100 text-slate-600",
};

export function StatusBadge({
  status,
  approvalStepsCompleted,
  approvalStepsRequired,
}: StatusBadgeProps) {
  const showApprovalProgress =
    status === "Ausstehend" &&
    typeof approvalStepsCompleted === "number" &&
    typeof approvalStepsRequired === "number";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}
    >
      {showApprovalProgress
        ? `${status} ${approvalStepsCompleted}/${approvalStepsRequired}`
        : status}
    </span>
  );
}