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
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-6">
        {message ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-xl font-bold">Antrag</h2>
              <p className="mt-1 text-sm text-slate-500">
                Übersicht über Zeitraum, Mitarbeiter und Status.
              </p>
            </div>

            <StatusBadge
              status={request.status}
              approvalStepsCompleted={request.approvalStepsCompleted}
              approvalStepsRequired={request.approvalStepsRequired}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Mitarbeiter
              </p>
              <p className="mt-1 font-medium">
                {employee ? employee.name : "Unbekannter Mitarbeiter"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Abteilung</p>
              <p className="mt-1 font-medium">
                {department ? department.name : "Keine Abteilung"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Abwesenheitsart
              </p>
              <p className="mt-1 font-medium">{request.absenceType}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Zeitraum</p>
              <p className="mt-1 font-medium">
                {formatDateRange(request.startDate, request.endDate)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Tage</p>
              <p className="mt-1 font-medium">{request.days} Tage</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Erstellt am
              </p>
              <p className="mt-1 font-medium">{formatDate(request.createdAt)}</p>
            </div>

            {request.comment ? (
              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-sm font-semibold text-slate-500">
                  Bemerkung
                </p>
                <p className="mt-1 font-medium">{request.comment}</p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Freigabehistorie</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dokumentierte Entscheidungen mit erwartetem Genehmiger,
              tatsächlichem Entscheider und Kommentar.
            </p>
          </div>

          <div className="grid gap-3">
            {approvalDecisions.map((decision) => (
              <div
                key={decision.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold">
                      Schritt {decision.stepOrder}:{" "}
                      {decision.decision === "approved"
                        ? "Genehmigt"
                        : "Abgelehnt"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {decision.decidedAtDateTime
                        ? formatDateTime(decision.decidedAtDateTime)
                        : formatDate(decision.decidedAt)}
                    </p>
                  </div>

                  {decision.isOverride ? (
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      HR/Admin Override
                    </span>
                  ) : (
                    <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Reguläre Entscheidung
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Erwarteter Genehmiger
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {decision.expectedApproverName ??
                        decision.approverName ??
                        "Nicht definiert"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
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
                  <div className="mt-3 rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Kommentar
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {decision.comment}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}

            {approvalDecisions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Für diesen Antrag wurde noch keine Entscheidung dokumentiert.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Stornierungshistorie</h2>
            <p className="mt-1 text-sm text-slate-500">
              Beantragte und entschiedene Stornierungen zu diesem Antrag.
            </p>
          </div>

          <div className="grid gap-3">
            {localCancellationRequests.map((cancellationRequest) => (
              <div
                key={cancellationRequest.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold">
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
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      cancellationRequest.status === "Ausstehend"
                        ? "bg-amber-100 text-amber-700"
                        : cancellationRequest.status === "Genehmigt"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cancellationRequest.status}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="text-xs font-semibold text-slate-500">Grund</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {cancellationRequest.reason}
                  </p>
                </div>

                {cancellationRequest.decisionComment ? (
                  <div className="mt-3 rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Entscheidungskommentar
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {cancellationRequest.decisionComment}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}

            {localCancellationRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Für diesen Antrag wurde noch keine Stornierung beantragt.
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <aside className="grid gap-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Aktionen</h2>
          <p className="mt-1 text-sm text-slate-500">
            Aktionen hängen vom Status und der aktuellen Rolle ab.
          </p>

          <div className="mt-5 grid gap-3">
            {canApproveRequest ? (
              <>
                {approvalIsOverride ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Du bearbeitest diesen Antrag als HR/Admin-Override.
                  </div>
                ) : null}

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
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
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleApproveRequest}
                  disabled={isPending}
                  className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Wird gespeichert..." : "Genehmigen"}
                </button>

                <button
                  type="button"
                  onClick={handleRejectRequest}
                  disabled={isPending}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Wird gespeichert..." : "Ablehnen"}
                </button>
              </>
            ) : null}

            {canEditRequest ? (
              <Link
                href={`/urlaubsantraege/${request.id}/bearbeiten`}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Antrag bearbeiten
              </Link>
            ) : null}

            {canCancelRequest ? (
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={isPending}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Wird gespeichert..." : "Antrag stornieren"}
              </button>
            ) : null}

            {canRequestCancellationWorkflow ? (
              <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="font-semibold text-amber-800">
                    Stornierung anfragen
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Dieser Antrag ist bereits teilweise oder vollständig
                    genehmigt. Die Stornierung muss deshalb freigegeben werden.
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-amber-800">
                    Grund der Stornierung
                  </span>
                  <textarea
                    value={cancellationReason}
                    onChange={(event) => {
                      setCancellationReason(event.target.value);
                      resetMessages();
                    }}
                    rows={4}
                    className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRequestCancellationWorkflow}
                  disabled={isPending}
                  className="w-fit rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Wird gespeichert..." : "Stornierung anfragen"}
                </button>
              </div>
            ) : null}

            {pendingCancellationRequest && canDecideCancellationWorkflow ? (
              <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="font-semibold text-amber-800">
                    Offene Stornierungsanfrage
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    {pendingCancellationRequest.reason}
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-amber-800">
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
                    className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleApproveCancellationWorkflow}
                    disabled={isPending}
                    className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Stornierung genehmigen
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectCancellationWorkflow}
                    disabled={isPending}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Stornierung ablehnen
                  </button>
                </div>
              </div>
            ) : null}

            {!canApproveRequest &&
            !canEditRequest &&
            !canCancelRequest &&
            !canRequestCancellationWorkflow &&
            !canDecideCancellationWorkflow ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Für diesen Antrag sind aktuell keine Aktionen verfügbar.
              </div>
            ) : null}
          </div>
        </article>

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

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Administrative Informationen</h2>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">Antrags-ID</span>
              <span className="font-medium text-slate-800">{request.id}</span>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-slate-500">Mitarbeiter-ID</span>
              <span className="font-medium text-slate-800">
                {request.employeeId}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
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
        </article>
      </aside>
    </section>
  );
}