"use client";

import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { currentUser } from "@/lib/current-user";
import {
  getEmployeeById,
  getNextApproverIdForVacationRequest,
  getVisibleApprovalRequestsForUser,
} from "@/lib/mock-queries";
import type { VacationRequest } from "@/lib/types";

const initialPendingRequests = getVisibleApprovalRequestsForUser(
  currentUser.employeeId,
  currentUser.role
);

type DecisionMessage = {
  text: string;
};

export function ApprovalsList() {
  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>(
    initialPendingRequests
  );
  const [decisionMessage, setDecisionMessage] =
    useState<DecisionMessage | null>(null);

  function handleApprove(request: VacationRequest) {
    const employee = getEmployeeById(request.employeeId);

    const updatedApprovalStepsCompleted = request.approvalStepsCompleted + 1;

    const isFullyApproved =
      updatedApprovalStepsCompleted >= request.approvalStepsRequired;

    const updatedRequest: VacationRequest = {
      ...request,
      approvalStepsCompleted: updatedApprovalStepsCompleted,
      status: isFullyApproved ? "Genehmigt" : "Ausstehend",
    };

    const nextApproverId = getNextApproverIdForVacationRequest(updatedRequest);
    const nextApprover = nextApproverId
      ? getEmployeeById(nextApproverId)
      : undefined;

    setPendingRequests((currentRequests) =>
      currentRequests.filter(
        (currentRequest) => currentRequest.id !== request.id
      )
    );

    if (isFullyApproved) {
      setDecisionMessage({
        text: `Der Antrag "${request.absenceType} von ${
          employee ? employee.name : "unbekannt"
        }" wurde lokal final genehmigt.`,
      });
      return;
    }

    setDecisionMessage({
      text: `Der Antrag "${request.absenceType} von ${
        employee ? employee.name : "unbekannt"
      }" wurde lokal genehmigt und an ${
        nextApprover ? nextApprover.name : "den nächsten Genehmiger"
      } weitergeleitet.`,
    });
  }

  function handleReject(request: VacationRequest) {
    const employee = getEmployeeById(request.employeeId);

    setPendingRequests((currentRequests) =>
      currentRequests.filter(
        (currentRequest) => currentRequest.id !== request.id
      )
    );

    setDecisionMessage({
      text: `Der Antrag "${request.absenceType} von ${
        employee ? employee.name : "unbekannt"
      }" wurde lokal abgelehnt.`,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Genehmigungen"
        title="Offene Freigaben"
        description="Hier siehst du Urlaubsanträge, die du gemäß deiner Rolle prüfen darfst."
        action={
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
            {pendingRequests.length} offene Freigaben
          </div>
        }
      />

      {decisionMessage ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {decisionMessage.text} In dieser Mockup-Version wird die Änderung
          noch nicht dauerhaft gespeichert.
        </div>
      ) : null}

      <section className="grid gap-4">
        {pendingRequests.map((request) => {
          const employee = getEmployeeById(request.employeeId);

          return (
            <VacationRequestCard
              key={request.id}
              request={request}
              employee={employee}
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => handleApprove(request)}
                    className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
                  >
                    Genehmigen
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(request)}
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
                  >
                    Ablehnen
                  </button>
                </>
              }
            />
          );
        })}

        {pendingRequests.length === 0 && (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine offenen Freigaben</h2>
            <p className="mt-2 text-slate-600">
              Aktuell gibt es keine Urlaubsanträge, die du gemäß deiner Rolle
              prüfen darfst.
            </p>
          </article>
        )}
      </section>
    </>
  );
}