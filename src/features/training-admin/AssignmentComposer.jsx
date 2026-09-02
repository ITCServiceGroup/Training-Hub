import { useMemo, useState } from "react";
import { ROLES } from "../../config/authorization";

const initialForm = (marketId) => ({
  title: "",
  description: "",
  contentType: "study_guide",
  contentId: "",
  isRequired: true,
  priority: "normal",
  availableFrom: "",
  dueAt: "",
  gracePeriodDays: 0,
  marketId: marketId || "",
  certificationType: "",
  certificationValidMonths: 12,
  audiences: [],
  prerequisiteIds: [],
  activateAfterSave: false,
});

const AssignmentComposer = ({ workspace, managerProfile, onSave, saving }) => {
  const [values, setValues] = useState(() =>
    initialForm(managerProfile?.market_id),
  );
  const [audienceType, setAudienceType] = useState("user");
  const [audienceTarget, setAudienceTarget] = useState("");
  const isRegionalManager = [ROLES.AOM, ROLES.SUPERVISOR].includes(
    managerProfile?.role,
  );

  const contentOptions = useMemo(
    () => ({
      study_guide: workspace.studyGuides.filter(
        (guide) => guide.is_published !== false,
      ),
      quiz: workspace.quizzes.filter((quiz) => !quiz.is_practice),
      learning_path: workspace.learningPaths.filter(
        (path) => path.status === "active",
      ),
    }),
    [workspace],
  );

  const activeProfiles = workspace.profiles.filter(
    (profile) =>
      profile.is_active &&
      (!values.marketId ||
        String(profile.market_id) === String(values.marketId)),
  );

  const audienceOptions =
    audienceType === "user"
      ? activeProfiles.map((profile) => ({
          value: profile.user_id,
          label: profile.display_name || profile.email,
        }))
      : audienceType === "supervisor"
        ? activeProfiles
            .filter((profile) => profile.role === ROLES.SUPERVISOR)
            .map((profile) => ({
              value: profile.user_id,
              label: profile.display_name || profile.email,
            }))
        : audienceType === "market"
          ? workspace.markets.map((market) => ({
              value: String(market.id),
              label: market.name,
            }))
          : Object.values(ROLES).map((role) => ({
              value: role,
              label: role.replaceAll("_", " "),
            }));

  const set = (name, value) =>
    setValues((current) => ({ ...current, [name]: value }));

  const addAudience = () => {
    if (!audienceTarget) return;
    const audience = {
      type: audienceType,
      user_id: ["user", "supervisor"].includes(audienceType)
        ? audienceTarget
        : null,
      market_id: audienceType === "market" ? Number(audienceTarget) : null,
      role: audienceType === "role" ? audienceTarget : null,
    };
    const signature = JSON.stringify(audience);
    set(
      "audiences",
      values.audiences.some((item) => JSON.stringify(item) === signature)
        ? values.audiences
        : [...values.audiences, audience],
    );
    setAudienceTarget("");
  };

  const audienceLabel = (audience) => {
    if (audience.user_id) {
      const profile = workspace.profiles.find(
        (item) => item.user_id === audience.user_id,
      );
      return `${audience.type}: ${profile?.display_name || profile?.email || audience.user_id}`;
    }
    if (audience.market_id) {
      return `market: ${workspace.markets.find((market) => market.id === audience.market_id)?.name || audience.market_id}`;
    }
    return `role: ${audience.role?.replaceAll("_", " ")}`;
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSave(values);
    setValues(initialForm(managerProfile?.market_id));
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Create an assignment
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Save a draft, optionally add prerequisites, then activate it for the
          selected audience.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Assignment title
          <input
            required
            maxLength={200}
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Priority
          <select
            value={values.priority}
            onChange={(event) => set("priority", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            {["low", "normal", "high", "urgent"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Description
        <textarea
          rows={2}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Content type
          <select
            value={values.contentType}
            onChange={(event) => {
              set("contentType", event.target.value);
              set("contentId", "");
            }}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="study_guide">Study guide</option>
            <option value="quiz">Official quiz</option>
            <option value="learning_path">Learning path</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
          Content
          <select
            required
            value={values.contentId}
            onChange={(event) => set("contentId", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Select content</option>
            {contentOptions[values.contentType].map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Available from
          <input
            type="datetime-local"
            value={values.availableFrom}
            onChange={(event) => set("availableFrom", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Due date
          <input
            type="datetime-local"
            value={values.dueAt}
            onChange={(event) => set("dueAt", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Grace period (days)
          <input
            type="number"
            min="0"
            max="365"
            value={values.gracePeriodDays}
            onChange={(event) => set("gracePeriodDays", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Market scope
          <select
            disabled={isRegionalManager}
            value={values.marketId}
            onChange={(event) => set("marketId", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
          >
            {!isRegionalManager && <option value="">Nationwide</option>}
            {workspace.markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700">
          <input
            type="checkbox"
            checked={values.isRequired}
            onChange={(event) => set("isRequired", event.target.checked)}
          />
          Required training
        </label>
      </div>

      <fieldset className="rounded-md border border-slate-200 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-semibold">Audience</legend>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
          <select
            value={audienceType}
            onChange={(event) => {
              setAudienceType(event.target.value);
              setAudienceTarget("");
            }}
            className="rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="user">Employee</option>
            <option value="supervisor">Supervisor team</option>
            <option value="market">Market</option>
            <option value="role">Role</option>
          </select>
          <select
            value={audienceTarget}
            onChange={(event) => setAudienceTarget(event.target.value)}
            className="rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Select audience</option>
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addAudience}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Add
          </button>
        </div>
        {values.audiences.length > 0 && (
          <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
            {values.audiences.map((audience, index) => (
              <li
                key={JSON.stringify(audience)}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
              >
                {audienceLabel(audience)}
                <button
                  type="button"
                  aria-label={`Remove ${audienceLabel(audience)}`}
                  onClick={() =>
                    set(
                      "audiences",
                      values.audiences.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  className="ml-2 font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Prerequisites
        <select
          multiple
          value={values.prerequisiteIds}
          onChange={(event) =>
            set(
              "prerequisiteIds",
              [...event.target.selectedOptions].map((option) => option.value),
            )
          }
          className="mt-1 min-h-24 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
        >
          {workspace.assignments
            .filter((assignment) => !["cancelled"].includes(assignment.status))
            .map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title} ({assignment.status})
              </option>
            ))}
        </select>
      </label>

      <fieldset className="grid gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-700 md:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">
          Optional certification
        </legend>
        <label className="text-sm font-medium">
          Certification name
          <input
            value={values.certificationType}
            onChange={(event) => set("certificationType", event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm font-medium">
          Valid months
          <input
            type="number"
            min="1"
            max="120"
            disabled={!values.certificationType}
            value={values.certificationValidMonths}
            onChange={(event) =>
              set("certificationValidMonths", event.target.value)
            }
            className="mt-1 w-full rounded-md border border-slate-300 p-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={values.activateAfterSave}
            onChange={(event) => set("activateAfterSave", event.target.checked)}
          />
          Activate immediately
        </label>
        <button
          disabled={saving || values.audiences.length === 0}
          className="rounded-md bg-primary px-5 py-2 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : values.activateAfterSave
              ? "Save and activate"
              : "Save draft"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentComposer;
