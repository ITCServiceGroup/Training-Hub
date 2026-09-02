import { useMemo, useState } from "react";
import { ROLES } from "../../config/authorization";
import ReasonDialog from "./ReasonDialog";

const ContentGovernancePanel = ({
  workspace,
  managerProfile,
  actions,
  busy,
}) => {
  const [guideId, setGuideId] = useState("");
  const [reviewDueAt, setReviewDueAt] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [reviewComments, setReviewComments] = useState({});
  const [republishVersion, setRepublishVersion] = useState(null);
  const canApprove = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(
    managerProfile?.role,
  );
  const reviewers = workspace.profiles.filter(
    (profile) =>
      profile.is_active &&
      [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(profile.role),
  );
  const reviewByVersion = useMemo(
    () =>
      Object.fromEntries(
        workspace.contentReviews.map((review) => [
          review.content_version_id,
          review,
        ]),
      ),
    [workspace.contentReviews],
  );

  const selectedGuide = workspace.studyGuides.find(
    (guide) => guide.id === guideId,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
      <section
        className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="snapshot-heading"
      >
        <h2 id="snapshot-heading" className="text-xl font-semibold">
          Snapshot a content version
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Capture the current study guide before review and publication.
        </p>
        <label className="mt-4 block text-sm font-medium">
          Study guide
          <select
            value={guideId}
            onChange={(event) => setGuideId(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Select a guide</option>
            {workspace.studyGuides.map((guide) => (
              <option key={guide.id} value={guide.id}>
                {guide.title}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium">
          Review due
          <input
            type="datetime-local"
            value={reviewDueAt}
            onChange={(event) => setReviewDueAt(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <button
          type="button"
          disabled={busy || !selectedGuide}
          onClick={() => actions.createVersion(selectedGuide, reviewDueAt)}
          className="mt-5 rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Create draft version
        </button>
      </section>

      <section
        className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        aria-labelledby="version-workflow-heading"
      >
        <h2 id="version-workflow-heading" className="text-xl font-semibold">
          Version workflow
        </h2>
        <div className="mt-4 space-y-4">
          {workspace.contentVersions.map((version) => {
            const review = reviewByVersion[version.id];
            return (
              <article
                key={version.id}
                className="rounded-md border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{version.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Version {version.version_number}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize dark:bg-slate-800">
                    {version.status.replace("_", " ")}
                  </span>
                </div>
                {review?.comments && (
                  <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
                    {review.comments}
                  </p>
                )}

                {version.status === "draft" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select
                      aria-label={`Reviewer for ${version.title}`}
                      value={reviewerId}
                      onChange={(event) => setReviewerId(event.target.value)}
                      className="rounded-md border border-slate-300 p-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    >
                      <option value="">Any administrator</option>
                      {reviewers.map((reviewer) => (
                        <option key={reviewer.user_id} value={reviewer.user_id}>
                          {reviewer.display_name || reviewer.email}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={busy}
                      type="button"
                      onClick={() =>
                        actions.submitReview(version.id, reviewerId)
                      }
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
                    >
                      Submit for review
                    </button>
                  </div>
                )}

                {canApprove &&
                  version.status === "in_review" &&
                  review?.status === "pending" && (
                    <div className="mt-3 space-y-2">
                      <label className="block text-sm font-medium">
                        Review comments
                        <textarea
                          value={reviewComments[review.id] || ""}
                          onChange={(event) =>
                            setReviewComments((current) => ({
                              ...current,
                              [review.id]: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            actions.decideReview(
                              review.id,
                              "approved",
                              reviewComments[review.id],
                            )
                          }
                          className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          disabled={
                            busy ||
                            (reviewComments[review.id] || "").trim().length < 10
                          }
                          type="button"
                          onClick={() =>
                            actions.decideReview(
                              review.id,
                              "changes_requested",
                              reviewComments[review.id],
                            )
                          }
                          className="rounded-md border border-amber-400 px-3 py-2 text-sm font-medium text-amber-800 disabled:opacity-50 dark:text-amber-200"
                        >
                          Request changes
                        </button>
                      </div>
                    </div>
                  )}

                {canApprove && version.status === "approved" && (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() => actions.publishVersion(version.id)}
                    className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Publish version
                  </button>
                )}
                {canApprove && version.status === "superseded" && (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() => setRepublishVersion(version)}
                    className="mt-3 rounded-md border border-amber-400 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200"
                  >
                    Restore this version
                  </button>
                )}
              </article>
            );
          })}
          {workspace.contentVersions.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No governed versions have been created.
            </p>
          )}
        </div>
      </section>
      <ReasonDialog
        open={Boolean(republishVersion)}
        title="Restore a prior content version"
        description="This republishes the selected approved version and supersedes the currently published version. The complete version and audit history will be retained."
        confirmLabel="Restore version"
        onCancel={() => setRepublishVersion(null)}
        onConfirm={async (reason) => {
          await actions.republishVersion(republishVersion.id, reason);
          setRepublishVersion(null);
        }}
      />
    </div>
  );
};

export default ContentGovernancePanel;
