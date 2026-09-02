import { useMemo, useState } from "react";
import ReasonDialog from "./ReasonDialog";

const date = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";

const CompliancePanel = ({
  workspace,
  onWaive,
  onCertificationStatus,
  busy,
}) => {
  const [reasonAction, setReasonAction] = useState(null);
  const enrollments = useMemo(
    () =>
      [...workspace.enrollments].sort((a, b) =>
        String(a.due_at || "9999").localeCompare(String(b.due_at || "9999")),
      ),
    [workspace.enrollments],
  );

  const counts = useMemo(
    () =>
      enrollments.reduce((result, enrollment) => {
        result[enrollment.status] = (result[enrollment.status] || 0) + 1;
        return result;
      }, {}),
    [enrollments],
  );

  return (
    <div className="space-y-6">
      <section aria-labelledby="compliance-summary-heading">
        <h2 id="compliance-summary-heading" className="sr-only">
          Compliance summary
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Assigned", counts.assigned || 0],
            ["In progress", counts.in_progress || 0],
            ["Overdue", counts.overdue || 0],
            [
              "Completed or waived",
              (counts.completed || 0) + (counts.waived || 0),
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt className="text-sm text-slate-600 dark:text-slate-300">
                {label}
              </dt>
              <dd className="mt-1 text-2xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="enrollment-queue-heading"
      >
        <h2 id="enrollment-queue-heading" className="text-xl font-semibold">
          Enrollment queue
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Managed learner enrollment status and due dates
            </caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="p-2">
                  Learner
                </th>
                <th scope="col" className="p-2">
                  Assignment
                </th>
                <th scope="col" className="p-2">
                  Status
                </th>
                <th scope="col" className="p-2">
                  Due
                </th>
                <th scope="col" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="p-2">
                    {enrollment.learner?.display_name ||
                      enrollment.learner?.email ||
                      "Learner"}
                  </td>
                  <td className="p-2">
                    {enrollment.assignment?.title || "Assignment"}
                  </td>
                  <td className="p-2 capitalize">
                    {enrollment.status.replace("_", " ")}
                  </td>
                  <td className="p-2">{date(enrollment.due_at)}</td>
                  <td className="p-2">
                    {["assigned", "in_progress", "overdue"].includes(
                      enrollment.status,
                    ) && (
                      <button
                        disabled={busy}
                        type="button"
                        onClick={() =>
                          setReasonAction({ type: "waive", enrollment })
                        }
                        className="rounded border border-slate-300 px-3 py-1 font-medium dark:border-slate-600"
                      >
                        Waive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-5 text-center text-slate-600 dark:text-slate-300"
                  >
                    No managed enrollments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="certification-queue-heading"
      >
        <h2 id="certification-queue-heading" className="text-xl font-semibold">
          Certification queue
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspace.certifications.map((certificate) => (
            <article
              key={certificate.id}
              className="rounded-md border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-semibold">
                  {certificate.certification_type}
                </h3>
                <span className="capitalize">{certificate.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {certificate.learner?.display_name ||
                  certificate.learner?.email ||
                  "Learner"}
              </p>
              <p className="mt-1 text-sm">
                Expires {date(certificate.expires_at)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {certificate.status === "active" && (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() =>
                      onCertificationStatus(certificate.id, "suspended")
                    }
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Suspend
                  </button>
                )}
                {certificate.status === "suspended" && (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() =>
                      onCertificationStatus(certificate.id, "active")
                    }
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Restore
                  </button>
                )}
                {!["revoked", "expired"].includes(certificate.status) && (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() =>
                      setReasonAction({ type: "revoke", certificate })
                    }
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 dark:text-red-300"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </article>
          ))}
          {workspace.certifications.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No certifications are in scope.
            </p>
          )}
        </div>
      </section>

      <ReasonDialog
        open={Boolean(reasonAction)}
        title={
          reasonAction?.type === "waive"
            ? "Waive enrollment"
            : "Revoke certification"
        }
        description="This decision is recorded in the immutable training audit history. Provide a specific operational reason."
        confirmLabel={
          reasonAction?.type === "waive"
            ? "Waive enrollment"
            : "Revoke certification"
        }
        onCancel={() => setReasonAction(null)}
        onConfirm={async (reason) => {
          try {
            if (reasonAction.type === "waive")
              await onWaive(reasonAction.enrollment.id, reason);
            else
              await onCertificationStatus(
                reasonAction.certificate.id,
                "revoked",
                reason,
              );
            setReasonAction(null);
          } catch {
            // The parent renders the server-safe error while this dialog remains open.
          }
        }}
      />
    </div>
  );
};

export default CompliancePanel;
