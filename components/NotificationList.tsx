"use client";

import Link from "next/link";
import { useTransition } from "react";

import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/lib/actions/notification-actions";

type NotificationListProps = {
  notifications: {
    id: string;
    title: string;
    message: string;
    href?: string;
    isRead: boolean;
    createdAt: string;
  }[];
  unreadCount: number;
};

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAsRead(notificationId: string) {
    startTransition(async () => {
      await markNotificationAsReadAction(notificationId);
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              Benachrichtigungen
            </h2>

            {unreadCount > 0 ? (
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                {unreadCount} ungelesen
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Aktuelle Hinweise zu Anträgen und Freigaben.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="w-fit rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Alle als gelesen markieren
          </button>
        ) : null}
      </div>

      {notifications.length > 0 ? (
        <ul className="grid gap-2">
          {notifications.map((notification) => {
            const content = (
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">
                    {notification.title}
                  </p>

                  {!notification.isRead ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      Neu
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notification.message}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatNotificationDate(notification.createdAt)}
                </p>
              </div>
            );

            return (
              <li
                key={notification.id}
                className={`rounded-lg border px-3 py-2.5 ${
                  notification.isRead
                    ? "border-slate-200 bg-white"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="block rounded-md outline-none transition hover:text-slate-950"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}

                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isPending}
                      className="w-fit rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Gelesen
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-sm font-medium text-slate-700">
            Keine Benachrichtigungen
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Neue Hinweise erscheinen hier, sobald Anträge erstellt oder
            bearbeitet werden.
          </p>
        </div>
      )}
    </article>
  );
}