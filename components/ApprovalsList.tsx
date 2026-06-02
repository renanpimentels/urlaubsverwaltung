"use client";

import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VacationRequestCard } from "@/components/VacationRequestCard";
import { vacationRequests } from "@/lib/mock-data";
import type { RequestStatus, VacationRequest } from "@/lib/types";

const initialPendingRequests = vacationRequests.filter(
  (request) => request.status === "Ausstehend"
);

type DecisionMessage = {
  requestTitle: string;
  newStatus: RequestStatus;
};

export function ApprovalsList() {
  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>(
    initialPendingRequests
  );
  const [decisionMessage, setDecisionMessage] =
    useState<DecisionMessage | null>(null);

  function handleDecision(request: VacationRequest, newStatus: RequestStatus) {
    setPendingRequests((currentRequests) =>
      currentRequests.filter(
        (currentRequest) => currentRequest.id !== request.id
      )
    );

    setDecisionMessage({
      requestTitle: `${request.absenceType} von ${request.employeeName}`,
      newStatus,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Manager-Bereich"
        title="Genehmigungen"
        description="Prüfe offene Urlaubsanträge und entscheide über Genehmigung oder Ablehnung."
        action={
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
            {pendingRequests.length} offene Anträge
          </div>
        }
      />

      {decisionMessage ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          Der Antrag &quot;{decisionMessage.requestTitle}&quot; wurde lokal auf{" "}
          {decisionMessage.newStatus} gesetzt. In dieser Mockup-Version wird die
          Änderung noch nicht gespeichert.
        </div>
      ) : null}

      <section className="grid gap-4">
        {pendingRequests.map((request) => (
          <VacationRequestCard
            key={request.id}
            request={request}
            actions={
              <>
                <button
                  type="button"
                  onClick={() => handleDecision(request, "Genehmigt")}
                  className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-teal-800"
                >
                  Genehmigen
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision(request, "Abgelehnt")}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
                >
                  Ablehnen
                </button>
              </>
            }
          />
        ))}

        {pendingRequests.length === 0 && (
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Keine offenen Anträge</h2>
            <p className="mt-2 text-slate-600">
              Aktuell gibt es keine Urlaubsanträge, die geprüft werden müssen.
            </p>
          </article>
        )}
      </section>
    </>
  );
}