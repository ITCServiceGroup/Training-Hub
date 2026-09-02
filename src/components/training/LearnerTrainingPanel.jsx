import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trainingService } from "../../services/api/training";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "No due date";

const LearnerTrainingPanel = () => {
  const [assignments, setAssignments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [pathProgress, setPathProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [training, certificates, progress] = await Promise.all([
        trainingService.getMyTraining(),
        trainingService.getMyCertifications(),
        trainingService.getMyLearningPathProgress(),
      ]);
      setAssignments(training);
      setCertifications(certificates);
      setPathProgress(progress);
      setAvailable(true);
    } catch (error) {
      // The lifecycle migration is deployed separately from the static site.
      // Hide this enhancement when its API is not available yet.
      if (error?.code === "PGRST202" || error?.code === "42P01") {
        setAvailable(false);
      } else {
        setActionError(
          "Your assigned training could not be loaded. Try again shortly.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const orderedAssignments = useMemo(() => {
    const order = {
      overdue: 0,
      in_progress: 1,
      assigned: 2,
      completed: 3,
      waived: 4,
      cancelled: 5,
    };
    return [...assignments].sort((a, b) => {
      const statusDifference = (order[a.status] ?? 9) - (order[b.status] ?? 9);
      if (statusDifference !== 0) return statusDifference;
      return String(a.due_at || "9999").localeCompare(
        String(b.due_at || "9999"),
      );
    });
  }, [assignments]);

  const handleStart = async (assignment) => {
    setActionError("");
    try {
      if (assignment.content_type === "quiz") {
        const code = await trainingService.issueAssignedQuizAccessCode(
          assignment.enrollment_id,
        );
        navigate("/quiz/access", { state: { accessCode: code } });
        return;
      }
      if (assignment.status === "assigned") {
        await trainingService.beginEnrollment(assignment.enrollment_id);
        await load();
      }
    } catch {
      setActionError("Training could not be started. Please retry.");
    }
  };

  const handleComplete = async (enrollmentId) => {
    setActionError("");
    try {
      await trainingService.completeEnrollment(enrollmentId);
      await load();
    } catch {
      setActionError(
        "Completion could not be recorded. Quiz assignments require authoritative result evidence.",
      );
    }
  };

  const handlePathStepStart = async (step) => {
    setActionError("");
    try {
      if (step.content_type === "quiz") {
        const code = await trainingService.issueLearningPathQuizCode(
          step.enrollment_id,
          step.sequence_number,
        );
        navigate("/quiz/access", { state: { accessCode: code } });
      } else {
        await trainingService.beginLearningPathItem(
          step.enrollment_id,
          step.sequence_number,
        );
        navigate(step.content_path || "/study");
        await load();
      }
    } catch {
      setActionError(
        "This learning path step could not be started. Complete earlier required steps first.",
      );
    }
  };

  const handlePathStepComplete = async (step) => {
    setActionError("");
    try {
      await trainingService.completeLearningPathItem(
        step.enrollment_id,
        step.sequence_number,
      );
      await load();
    } catch {
      setActionError("This learning path step could not be completed.");
    }
  };

  if (!available) return null;

  return (
    <section
      aria-labelledby="my-training-heading"
      className="border-b border-slate-200 bg-white px-4 py-8 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              My learning
            </p>
            <h2
              id="my-training-heading"
              className="text-3xl font-bold text-slate-900 dark:text-white"
            >
              Assigned training
            </h2>
          </div>
          <Link
            to="/study"
            className="font-medium text-primary hover:underline"
          >
            Browse the catalog
          </Link>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-800"
          >
            {actionError}
          </div>
        )}

        {loading ? (
          <p aria-live="polite" className="text-slate-600 dark:text-slate-300">
            Loading your training…
          </p>
        ) : orderedAssignments.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-medium text-slate-900 dark:text-white">
              You have no active assignments.
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Use the catalog to continue self-directed learning.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderedAssignments.slice(0, 6).map((assignment) => {
              const completed = ["completed", "waived"].includes(
                assignment.status,
              );
              return (
                <article
                  key={assignment.enrollment_id}
                  className="rounded-lg border border-slate-200 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    {assignment.is_required && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {assignment.description || "Training assignment"}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="font-medium capitalize">
                        {assignment.status.replace("_", " ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Due</dt>
                      <dd className="font-medium">
                        {formatDate(assignment.due_at)}
                      </dd>
                    </div>
                  </dl>
                  {assignment.content_type === "learning_path" && (
                    <ol className="mt-4 space-y-2 pl-5 text-sm">
                      {pathProgress
                        .filter(
                          (step) =>
                            step.enrollment_id === assignment.enrollment_id,
                        )
                        .map((step) => (
                          <li
                            key={step.sequence_number}
                            className="rounded-md border border-slate-200 p-2 dark:border-slate-700"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span>
                                <strong>{step.title}</strong>
                                {!step.is_required && " · optional"}
                              </span>
                              <span className="capitalize text-slate-500">
                                {step.status.replace("_", " ")}
                              </span>
                            </div>
                            {step.status !== "completed" && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handlePathStepStart(step)}
                                  className="rounded border border-slate-300 px-2 py-1 font-medium dark:border-slate-600"
                                >
                                  {step.status === "not_started"
                                    ? "Start"
                                    : "Open"}
                                </button>
                                {step.content_type === "study_guide" &&
                                  step.status === "in_progress" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handlePathStepComplete(step)
                                      }
                                      className="rounded bg-primary px-2 py-1 font-medium text-white"
                                    >
                                      Complete step
                                    </button>
                                  )}
                              </div>
                            )}
                          </li>
                        ))}
                    </ol>
                  )}
                  {!completed && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {assignment.content_type ===
                      "learning_path" ? null : assignment.is_locked ? (
                        <span className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          Complete prerequisites first
                        </span>
                      ) : assignment.content_type === "quiz" ? (
                        <button
                          type="button"
                          onClick={() => void handleStart(assignment)}
                          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                        >
                          {assignment.status === "assigned"
                            ? "Start quiz"
                            : "Continue quiz"}
                        </button>
                      ) : (
                        <Link
                          to={assignment.content_path || "/study"}
                          onClick={() => void handleStart(assignment)}
                          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-primary-dark"
                        >
                          {assignment.status === "assigned"
                            ? "Start"
                            : "Continue"}
                        </Link>
                      )}
                      {assignment.content_type === "study_guide" &&
                        assignment.status === "in_progress" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleComplete(assignment.enrollment_id)
                            }
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                          >
                            Mark complete
                          </button>
                        )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {certifications.length > 0 && (
          <div className="mt-7">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Certifications
            </h3>
            <ul className="mt-3 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.slice(0, 6).map((certification) => (
                <li
                  key={certification.id}
                  className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"
                >
                  <span className="font-semibold">
                    {certification.certification_type}
                  </span>
                  <span className="mt-1 block capitalize text-slate-600 dark:text-slate-300">
                    {certification.status} · expires{" "}
                    {formatDate(certification.expires_at)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default LearnerTrainingPanel;
