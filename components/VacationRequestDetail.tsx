"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { VacationBalanceCard } from "@/components/VacationBalanceCard";
import {
  approveVacationRequestAction,
  rejectVacationRequestAction,
} from "@/lib/actions/vacation-request-approval-actions";
import { cancelVacationRequestAction } from "@/lib/actions/vacation-request-cancellation-actions";
import {
  approveVacationRequestCancellationAction,
  rejectVacationRequestCancellationAction,
  requestVacationRequestCancellationAction,
} from "@/lib/actions/vacation-request-cancellation-workflow-actions";
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import {
  canApproveVacationRequestWithNextApprover,
  canCancelOwnVacationRequest,
  canEditOwnVacationRequest,
  isApprovalOverride,
} from "@/lib/permissions";
import type {
  ApprovalDecisionWithApprover,
  CancellationRequestWithDetails,
  Department,
  Employee,
  UserRole,
  VacationBalance,
  VacationRequest,
} from "@/lib/types";

type CurrentUserForClient = {
  id: string;
  employeeId?: string;
  role: UserRole;
};

type VacationRequestDetailProps = {
  currentUser: CurrentUserForClient;
  initialRequest: VacationRequest;
  employee?: Employee;
  department?: Department | null;
  vacationBalance?: VacationBalance;
  approvalDecisions: ApprovalDecisionWithApprover[];
  cancellationRequests: CancellationRequestWithDetails[];
  nextApproverId?: string;
};

function formatDateTime(value: string | undefined) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </article>
  );
}

function InfoBox({
  variant,
  children,
}: {
  variant: "success" | "error" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const classNameByVariant = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${classNameByVariant[variant]}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
    >
      {children}
    </Link>
  );
}

function DangerButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function VacationRequestDetail({
  currentUser,
  initialRequest,
  employee,
  department,
  vacationBalance,
  approvalDecisions,
  cancellationRequests,
  nextApproverId,
}: VacationRequestDetailProps) {
  const [request, setRequest] = useState<VacationRequest>(initialRequest);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [decisionComment, setDecisionComment] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationDecisionComment, setCancellationDecisionComment] =
    useState("");
  const [localCancellationRequests, setLocalCancellationRequests] =
    useState<CancellationRequestWithDetails[]>(cancellationRequests);
  const [isPending, startTransition] = useTransition();
  const [approvalActionCompleted, setApprovalActionCompleted] = useState(false);

  const canCancelRequest = canCancelOwnVacationRequest(
    request,
    currentUser.employeeId
  );

  const canEditRequest = canEditOwnVacationRequest(
    request,
    currentUser.employeeId
  );

  const canApproveRequest =
    !approvalActionCompleted &&
    canApproveVacationRequestWithNextApprover(
      request,
      nextApproverId,
      currentUser.employeeId,
      currentUser.role
    );

  const approvalIsOverride = isApprovalOverride(
    nextApproverId,
    currentUser.employeeId,
    currentUser.role
  );

  const pendingCancellationRequest = localCancellationRequests.find(
    (cancellationRequest) => cancellationRequest.status === "Ausstehend"
  );

  const canRequestCancellationWorkflow =
    Boolean(currentUser.employeeId) &&
    currentUser.employeeId === request.employeeId &&
    !pendingCancellationRequest &&
    (request.status === "Genehmigt" ||
      (request.status === "Ausstehend" &&
        request.approvalStepsCompleted > 0));

  const canDecideCancellationWorkflow =
    Boolean(pendingCancellationRequest) &&
    (currentUser.role === "hr" ||
      currentUser.role === "admin" ||
      canApproveRequest);

  function resetMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function handleApproveRequest() {
    if (!canApproveRequest) {
      return;
    }

    resetMessages();

    startTransition(async () => {
      try {
        const result = await approveVacationRequestAction(
          request.id,
          decisionComment
        );

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: result.status,
          approvalStepsCompleted: result.approvalStepsCompleted,
        }));

        setApprovalActionCompleted(true);
        setDecisionComment("");
        setMessage(result.message);
      } catch {
        setErrorMessage("Der Antrag konnte nicht genehmigt werden.");
      }
    });
  }

  function handleRejectRequest() {
    if (!canApproveRequest) {
      return;
    }

    resetMessages();

    if (!decisionComment.trim()) {
      setErrorMessage("Bitte gib einen Kommentar für die Ablehnung ein.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await rejectVacationRequestAction(
          request.id,
          decisionComment
        );

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: result.status,
          approvalStepsCompleted: result.approvalStepsCompleted,
        }));

        setApprovalActionCompleted(true);
        setDecisionComment("");
        setMessage(result.message);
      } catch {
        setErrorMessage("Der Antrag konnte nicht abgelehnt werden.");
      }
    });
  }

  function handleCancelRequest() {
    if (!canCancelRequest) {
      return;
    }

    resetMessages();

    startTransition(async () => {
      try {
        const result = await cancelVacationRequestAction(request.id);

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: result.status,
          approvalStepsCompleted: result.approvalStepsCompleted,
        }));

        setApprovalActionCompleted(true);
        setMessage(result.message);
      } catch {
        setErrorMessage("Der Antrag konnte nicht storniert werden.");
      }
    });
  }

  function handleRequestCancellationWorkflow() {
    resetMessages();

    if (!cancellationReason.trim()) {
      setErrorMessage("Bitte gib einen Grund für die Stornierung ein.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestVacationRequestCancellationAction(
          request.id,
          cancellationReason
        );

        setCancellationReason("");
        setMessage(result.message);
        setApprovalActionCompleted(true);
      } catch {
        setErrorMessage("Die Stornierung konnte nicht beantragt werden.");
      }
    });
  }

  function handleApproveCancellationWorkflow() {
    resetMessages();

    if (!pendingCancellationRequest) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await approveVacationRequestCancellationAction(
          pendingCancellationRequest.id,
          cancellationDecisionComment
        );

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: "Storniert",
        }));

        setLocalCancellationRequests((currentRequests) =>
          currentRequests.map((cancellationRequest) =>
            cancellationRequest.id === pendingCancellationRequest.id
              ? {
                  ...cancellationRequest,
                  status: "Genehmigt",
                  decisionComment: cancellationDecisionComment || undefined,
                  decidedAt: new Date().toISOString(),
                }
              : cancellationRequest
          )
        );

        setCancellationDecisionComment("");
        setMessage(result.message);
      } catch {
        setErrorMessage("Die Stornierung konnte nicht genehmigt werden.");
      }
    });
  }

  function handleRejectCancellationWorkflow() {
    resetMessages();

    if (!pendingCancellationRequest) {
      return;
    }

    if (!cancellationDecisionComment.trim()) {
      setErrorMessage("Bitte gib einen Kommentar für die Ablehnung ein.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await rejectVacationRequestCancellationAction(
          pendingCancellationRequest.id,
          cancellationDecisionComment
        );

        setLocalCancellationRequests((currentRequests) =>
          currentRequests.map((cancellationRequest) =>
            cancellationRequest.id === pendingCancellationRequest.id
              ? {
                  ...cancellationRequest,
                  status: "Abgelehnt",
                  decisionComment: cancellationDecisionComment,
                  decidedAt: new Date().toISOString(),
                }
              : cancellationRequest
          )
        );

        setCancellationDecisionComment("");
        setMessage(result.message);
      } catch {
        setErrorMessage("Die Stornierung konnte nicht abgelehnt werden.");
      }
    });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <div className="grid gap-5">
        {message ? <InfoBox variant="success">{message}</InfoBox> : null}
        {errorMessage ? <InfoBox variant="error">{errorMessage}</InfoBox> : null}

        <SectionCard
          title="Antrag"
          description="Übersicht über Zeitraum, Mitarbeiter und Status."
        >
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Aktueller Status
              </p>
              <div className="mt-1">
                <StatusBadge
                  status={request.status}
                  approvalStepsCompleted={request.approvalStepsCompleted}
                  approvalStepsRequired={request.approvalStepsRequired}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailCard
              label="Mitarbeiter"
              value={employee ? employee.name : "Unbekannter Mitarbeiter"}
            />
            <DetailCard
              label="Abteilung"
              value={department ? department.name : "Keine Abteilung"}
            />
            <DetailCard label="Abwesenheitsart" value={request.absenceType} />
            <DetailCard
              label="Zeitraum"
              value={formatDateRange(request.startDate, request.endDate)}
            />
            <DetailCard label="Tage" value={`${request.days} Tage`} />
            <DetailCard label="Erstellt am" value={formatDate(request.createdAt)} />

            {request.comment ? (
              <DetailCard
                label="Bemerkung"
                value={request.comment}
                className="md:col-span-2"
              />
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Freigabehistorie"
          description="Dokumentierte Entscheidungen mit erwartetem Genehmiger, tatsächlichem Entscheider und Kommentar."
        >
          <div className="grid gap-3">
            {approvalDecisions.map((decision) => (
              <div
                key={decision.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Schritt {decision.stepOrder}:{" "}
                      {decision.decision === "approved"
                        ? "Genehmigt"
                        : "Abgelehnt"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {decision.decidedAtDateTime
                        ? formatDateTime(decision.decidedAtDateTime)
                        : formatDate(decision.decidedAt)}
                    </p>
                  </div>

                  {decision.isOverride ? (
                    <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      HR/Admin Override
                    </span>
                  ) : (
                    <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      Reguläre Entscheidung
                    </span>
                  )}
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">
                      Erwarteter Genehmiger
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {decision.expectedApproverName ??
                        decision.approverName ??
                        "Nicht definiert"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">
                      Tatsächlich entschieden von
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {decision.decidedByEmployeeName ??
                        decision.decidedByUserEmail ??
                        decision.approverName}
                    </p>

                    {decision.decidedByUserEmail ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {decision.decidedByUserEmail}
                      </p>
                    ) : null}
                  </div>
                </div>

                {decision.comment ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">
                      Kommentar
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {decision.comment}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}

            {approvalDecisions.length === 0 ? (
              <InfoBox variant="neutral">
                Für diesen Antrag wurde noch keine Entscheidung dokumentiert.
              </InfoBox>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Stornierungshistorie"
          description="Beantragte und entschiedene Stornierungen zu diesem Antrag."
        >
          <div className="grid gap-3">
            {localCancellationRequests.map((cancellationRequest) => (
              <div
                key={cancellationRequest.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Stornierung: {cancellationRequest.status}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Beantragt von{" "}
                      {cancellationRequest.requestedByEmployeeName ??
                        cancellationRequest.requestedByUserEmail ??
                        "Unbekannt"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                      cancellationRequest.status === "Ausstehend"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : cancellationRequest.status === "Genehmigt"
                          ? "bg-green-50 text-green-700 ring-green-200"
                          : "bg-red-50 text-red-700 ring-red-200"
                    }`}
                  >
                    {cancellationRequest.status}
                  </span>
                </div>

                <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-xs font-semibold text-slate-500">Grund</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {cancellationRequest.reason}
                  </p>
                </div>

                {cancellationRequest.decisionComment ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">
                      Entscheidungskommentar
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {cancellationRequest.decisionComment}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}

            {localCancellationRequests.length === 0 ? (
              <InfoBox variant="neutral">
                Für diesen Antrag wurde noch keine Stornierung beantragt.
              </InfoBox>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <aside className="grid gap-5 self-start">
        <SectionCard
          title="Aktionen"
          description="Aktionen hängen vom Status und der aktuellen Rolle ab."
        >
          <div className="grid gap-3">
            {canApproveRequest ? (
              <>
                {approvalIsOverride ? (
                  <InfoBox variant="warning">
                    Du bearbeitest diesen Antrag als HR/Admin-Override.
                  </InfoBox>
                ) : null}

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Kommentar zur Entscheidung
                  </span>
                  <textarea
                    value={decisionComment}
                    onChange={(event) => {
                      setDecisionComment(event.target.value);
                      resetMessages();
                    }}
                    rows={4}
                    placeholder="Optional bei Genehmigung, erforderlich bei Ablehnung."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500"
                  />
                </label>

                <PrimaryButton
                  onClick={handleApproveRequest}
                  disabled={isPending}
                >
                  {isPending ? "Wird gespeichert..." : "Genehmigen"}
                </PrimaryButton>

                <DangerButton onClick={handleRejectRequest} disabled={isPending}>
                  {isPending ? "Wird gespeichert..." : "Ablehnen"}
                </DangerButton>
              </>
            ) : null}

            {canEditRequest ? (
              <SecondaryLink href={`/urlaubsantraege/${request.id}/bearbeiten`}>
                Antrag bearbeiten
              </SecondaryLink>
            ) : null}

            {canCancelRequest ? (
              <DangerButton onClick={handleCancelRequest} disabled={isPending}>
                {isPending ? "Wird gespeichert..." : "Antrag stornieren"}
              </DangerButton>
            ) : null}

            {canRequestCancellationWorkflow ? (
              <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Stornierung anfragen
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    Dieser Antrag ist bereits teilweise oder vollständig
                    genehmigt. Die Stornierung muss deshalb freigegeben werden.
                  </p>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-amber-800">
                    Grund der Stornierung
                  </span>
                  <textarea
                    value={cancellationReason}
                    onChange={(event) => {
                      setCancellationReason(event.target.value);
                      resetMessages();
                    }}
                    rows={4}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-amber-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRequestCancellationWorkflow}
                  disabled={isPending}
                  className="w-fit rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Wird gespeichert..." : "Stornierung anfragen"}
                </button>
              </div>
            ) : null}

            {pendingCancellationRequest && canDecideCancellationWorkflow ? (
              <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Offene Stornierungsanfrage
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    {pendingCancellationRequest.reason}
                  </p>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-amber-800">
                    Kommentar zur Entscheidung
                  </span>
                  <textarea
                    value={cancellationDecisionComment}
                    onChange={(event) => {
                      setCancellationDecisionComment(event.target.value);
                      resetMessages();
                    }}
                    rows={4}
                    placeholder="Optional bei Genehmigung, erforderlich bei Ablehnung."
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-amber-500"
                  />
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleApproveCancellationWorkflow}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Stornierung genehmigen
                  </button>

                  <DangerButton
                    onClick={handleRejectCancellationWorkflow}
                    disabled={isPending}
                  >
                    Stornierung ablehnen
                  </DangerButton>
                </div>
              </div>
            ) : null}

            {!canApproveRequest &&
            !canEditRequest &&
            !canCancelRequest &&
            !canRequestCancellationWorkflow &&
            !canDecideCancellationWorkflow ? (
              <InfoBox variant="neutral">
                Für diesen Antrag sind aktuell keine Aktionen verfügbar.
              </InfoBox>
            ) : null}
          </div>
        </SectionCard>

        {vacationBalance ? (
          <VacationBalanceCard
            total={vacationBalance.total}
            used={vacationBalance.used}
            pending={vacationBalance.pending}
            available={vacationBalance.available}
            requestedDays={
              request.absenceType === "Urlaub" && request.status !== "Storniert"
                ? request.days
                : undefined
            }
            title={`Urlaubssaldo ${vacationBalance.year}`}
            description="Übersicht zur Bewertung dieses Antrags."
          />
        ) : null}

        <SectionCard title="Administrative Informationen">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
              <span className="text-slate-500">Antrags-ID</span>
              <span className="break-all font-medium text-slate-800">
                {request.id}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
              <span className="text-slate-500">Mitarbeiter-ID</span>
              <span className="break-all font-medium text-slate-800">
                {request.employeeId}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
              <span className="text-slate-500">Freigabe</span>
              <span className="font-medium text-slate-800">
                {request.approvalStepsCompleted}/
                {request.approvalStepsRequired}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-800">
                {request.status}
              </span>
            </div>
          </div>
        </SectionCard>
      </aside>
    </section>
  );
}