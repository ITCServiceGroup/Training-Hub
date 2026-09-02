import { useCallback, useEffect, useMemo, useState } from "react";
import { useRBAC } from "../../contexts/RBACContext";
import AssignmentComposer from "./AssignmentComposer";
import CompliancePanel from "./CompliancePanel";
import ContentGovernancePanel from "./ContentGovernancePanel";
import LearningPathComposer from "./LearningPathComposer";
import { trainingAdminService } from "./trainingAdminService";

const emptyWorkspace = {
  assignments: [],
  enrollments: [],
  certifications: [],
  profiles: [],
  markets: [],
  studyGuides: [],
  quizzes: [],
  learningPaths: [],
  contentVersions: [],
  contentReviews: [],
};

const tabs = [
  ["assignments", "Assignments"],
  ["compliance", "Compliance"],
  ["paths", "Learning paths"],
  ["governance", "Content governance"],
];

const TrainingManagementPage = () => {
  const { profile } = useRBAC();
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [activeTab, setActiveTab] = useState("assignments");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setWorkspace(await trainingAdminService.getWorkspace());
    } catch (loadError) {
      if (["42P01", "PGRST202"].includes(loadError?.code)) {
        setError(
          "Training lifecycle services have not been deployed to this environment yet.",
        );
      } else {
        setError(
          loadError?.message || "Training operations could not be loaded.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (operation, successMessage) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await operation();
      setNotice(
        typeof successMessage === "function"
          ? successMessage(result)
          : successMessage,
      );
      await load();
      return result;
    } catch (operationError) {
      setError(
        operationError?.message || "The operation could not be completed.",
      );
      throw operationError;
    } finally {
      setBusy(false);
    }
  };

  const saveAssignment = async (values) => {
    try {
      await run(
        async () => {
          const assignmentId =
            await trainingAdminService.saveAssignment(values);
          await trainingAdminService.setPrerequisites(
            assignmentId,
            values.prerequisiteIds,
          );
          if (values.activateAfterSave)
            await trainingAdminService.activateAssignment(assignmentId);
          return assignmentId;
        },
        values.activateAfterSave
          ? "Assignment created and activated."
          : "Assignment draft saved.",
      );
    } catch {
      // The page-level alert contains the server-safe error; keep the form available.
    }
  };

  const savePath = async (values) => {
    try {
      await run(
        async () => {
          const pathId = await trainingAdminService.saveLearningPath(values);
          if (values.activateAfterSave)
            await trainingAdminService.activateLearningPath(pathId);
          return pathId;
        },
        values.activateAfterSave
          ? "Learning path saved and activated."
          : "Learning path draft saved.",
      );
    } catch {
      // Error is rendered in the shared alert.
    }
  };

  const assignmentCounts = useMemo(
    () =>
      workspace.assignments.reduce((result, assignment) => {
        result[assignment.status] = (result[assignment.status] || 0) + 1;
        return result;
      }, {}),
    [workspace.assignments],
  );

  if (loading)
    return (
      <p aria-live="polite" className="p-6 text-slate-600 dark:text-slate-300">
        Loading training operations…
      </p>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Training operations
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Assign learning, manage exceptions, issue certifications, and govern
            content versions.
          </p>
        </div>
        <button
          disabled={busy}
          type="button"
          onClick={() =>
            run(
              () => trainingAdminService.refreshDeadlines(),
              (result) =>
                `${result.overdue_enrollments} overdue enrollment(s) and ${result.expired_certifications} expired certification(s) refreshed.`,
            ).catch(() => {})
          }
          className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          Refresh deadlines
        </button>
      </header>

      {notice && (
        <div
          role="status"
          className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100"
        >
          {notice}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-red-900 dark:bg-red-900/20 dark:text-red-100"
        >
          {error}
        </div>
      )}

      <nav
        aria-label="Training operations sections"
        className="overflow-x-auto border-b border-slate-200 dark:border-slate-700"
      >
        <div role="tablist" className="flex min-w-max gap-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`border-b-2 px-4 py-3 font-medium ${activeTab === id ? "border-primary text-primary" : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div role="tabpanel">
        {activeTab === "assignments" && (
          <div className="grid gap-6 2xl:grid-cols-[minmax(420px,1fr)_minmax(0,1.1fr)]">
            <AssignmentComposer
              workspace={workspace}
              managerProfile={profile}
              onSave={saveAssignment}
              saving={busy}
            />
            <section
              aria-labelledby="assignment-list-heading"
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="assignment-list-heading"
                    className="text-xl font-semibold"
                  >
                    Managed assignments
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {assignmentCounts.active || 0} active ·{" "}
                    {assignmentCounts.draft || 0} draft
                  </p>
                </div>
              </div>
              <ul className="mt-4 list-none space-y-3 p-0">
                {workspace.assignments.map((assignment) => {
                  const statusCounts = assignment.enrollments.reduce(
                    (result, enrollment) => {
                      result[enrollment.status] =
                        (result[enrollment.status] || 0) + 1;
                      return result;
                    },
                    {},
                  );
                  return (
                    <li
                      key={assignment.id}
                      className="rounded-md border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-sm capitalize text-slate-600 dark:text-slate-300">
                            {assignment.content_type.replace("_", " ")} ·{" "}
                            {assignment.priority} priority
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize dark:bg-slate-800">
                          {assignment.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">
                        {assignment.enrollments.length} enrolled ·{" "}
                        {statusCounts.completed || 0} completed ·{" "}
                        {statusCounts.overdue || 0} overdue
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assignment.status === "draft" && (
                          <button
                            disabled={busy}
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  trainingAdminService.activateAssignment(
                                    assignment.id,
                                  ),
                                "Assignment activated.",
                              ).catch(() => {})
                            }
                            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}
                        {assignment.status === "active" && (
                          <button
                            disabled={busy}
                            type="button"
                            onClick={() =>
                              run(
                                () =>
                                  trainingAdminService.setAssignmentStatus(
                                    assignment.id,
                                    "closed",
                                  ),
                                "Assignment closed.",
                              ).catch(() => {})
                            }
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
                          >
                            Close
                          </button>
                        )}
                        {["draft", "active"].includes(assignment.status) && (
                          <button
                            disabled={busy}
                            type="button"
                            onClick={() =>
                              window.confirm(
                                `Cancel ${assignment.title}? Incomplete enrollments will be retained as cancelled.`,
                              ) &&
                              run(
                                () =>
                                  trainingAdminService.setAssignmentStatus(
                                    assignment.id,
                                    "cancelled",
                                  ),
                                "Assignment cancelled.",
                              ).catch(() => {})
                            }
                            className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
                {workspace.assignments.length === 0 && (
                  <li className="rounded-md bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    No assignments have been created in your scope.
                  </li>
                )}
              </ul>
            </section>
          </div>
        )}

        {activeTab === "compliance" && (
          <CompliancePanel
            workspace={workspace}
            busy={busy}
            onWaive={(id, reason) =>
              run(
                () => trainingAdminService.waiveEnrollment(id, reason),
                "Enrollment waived.",
              )
            }
            onCertificationStatus={(id, status, reason) =>
              run(
                () =>
                  trainingAdminService.setCertificationStatus(
                    id,
                    status,
                    reason,
                  ),
                `Certification ${status}.`,
              )
            }
          />
        )}
        {activeTab === "paths" && (
          <LearningPathComposer
            workspace={workspace}
            managerProfile={profile}
            onSave={savePath}
            saving={busy}
          />
        )}
        {activeTab === "governance" && (
          <ContentGovernancePanel
            workspace={workspace}
            managerProfile={profile}
            busy={busy}
            actions={{
              createVersion: (guide, dueAt) =>
                run(
                  () => trainingAdminService.createContentVersion(guide, dueAt),
                  "Draft content version created.",
                ),
              submitReview: (versionId, reviewerId) =>
                run(
                  () =>
                    trainingAdminService.submitContentVersion(
                      versionId,
                      reviewerId,
                    ),
                  "Version submitted for review.",
                ),
              decideReview: (reviewId, decision, comments) =>
                run(
                  () =>
                    trainingAdminService.decideContentReview(
                      reviewId,
                      decision,
                      comments,
                    ),
                  decision === "approved"
                    ? "Version approved."
                    : "Changes requested.",
                ),
              publishVersion: (versionId) =>
                run(
                  () => trainingAdminService.publishContentVersion(versionId),
                  "Content version published.",
                ),
              republishVersion: (versionId, reason) =>
                run(
                  () =>
                    trainingAdminService.republishContentVersion(
                      versionId,
                      reason,
                    ),
                  "Prior content version restored and published.",
                ),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrainingManagementPage;
