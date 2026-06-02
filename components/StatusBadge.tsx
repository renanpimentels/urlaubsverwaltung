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
};

export function StatusBadge({
  status,
  approvalStepsCompleted,
  approvalStepsRequired,
}: StatusBadgeProps) {
  const shouldShowApprovalProgress =
    status === "Ausstehend" &&
    approvalStepsCompleted !== undefined &&
    approvalStepsRequired !== undefined;

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}
    >
      {status}
      {shouldShowApprovalProgress
        ? ` ${approvalStepsCompleted}/${approvalStepsRequired}`
        : ""}
    </span>
  );
}