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
import { formatDate, formatDateRange } from "@/lib/date-formatters";
import {
  canApproveVacationRequestWithNextApprover,
  canCancelOwnVacationRequest,
  canEditOwnVacationRequest,
  isApprovalOverride,
} from "@/lib/permissions";

import type {
  ApprovalDecisionWithApprover,
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
  nextApproverId?: string;
};

export function VacationRequestDetail({
  currentUser,
  initialRequest,
  employee,
  department,
  vacationBalance,
  approvalDecisions,
  nextApproverId,
}: VacationRequestDetailProps) {
  const [request, setRequest] = useState<VacationRequest>(initialRequest);
  const [message, setMessage] = useState("");
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

  function handleApproveRequest() {
    if (!canApproveRequest) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await approveVacationRequestAction(request.id);

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: result.status,
          approvalStepsCompleted: result.approvalStepsCompleted,
        }));

        setApprovalActionCompleted(true);
        setMessage(result.message);
      } catch {
        setMessage("Der Antrag konnte nicht genehmigt werden.");
      }
    });
  }

  function handleRejectRequest() {
    if (!canApproveRequest) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await rejectVacationRequestAction(request.id);

        setRequest((currentRequest) => ({
          ...currentRequest,
          status: result.status,
          approvalStepsCompleted: result.approvalStepsCompleted,
        }));

        setApprovalActionCompleted(true);
        setMessage(result.message);
      } catch {
        setMessage("Der Antrag konnte nicht abgelehnt werden.");
      }
    });
  }

  function handleCancelRequest() {
    if (!canCancelRequest) {
      return;
    }

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
        setMessage("Der Antrag konnte nicht storniert werden.");
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
              Dokumentierte Entscheidungen zu diesem Antrag.
            </p>
          </div>

          <div className="grid gap-3">
            {approvalDecisions.map((decision) => (
              <div
                key={decision.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-semibold">
                  Schritt {decision.stepOrder}:{" "}
                  {decision.decision === "approved"
                    ? "Genehmigt"
                    : "Abgelehnt"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {decision.approverName
                    ? `${decision.approverName} · ${formatDate(
                        decision.decidedAt
                      )}`
                    : formatDate(decision.decidedAt)}
                </p>

                {decision.comment ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {decision.comment}
                  </p>
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

            {!canApproveRequest && !canEditRequest && !canCancelRequest ? (
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