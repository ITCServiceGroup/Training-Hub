import { useMemo, useState } from "react";
import { ROLES } from "../../config/authorization";

const LearningPathComposer = ({
  workspace,
  managerProfile,
  onSave,
  saving,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marketId, setMarketId] = useState(managerProfile?.market_id || "");
  const [selectedContent, setSelectedContent] = useState("");
  const [items, setItems] = useState([]);
  const [activateAfterSave, setActivateAfterSave] = useState(false);
  const isRegionalManager = [ROLES.AOM, ROLES.SUPERVISOR].includes(
    managerProfile?.role,
  );

  const options = useMemo(
    () => [
      ...workspace.studyGuides
        .filter((guide) => guide.is_published !== false)
        .map((guide) => ({
          value: `study_guide:${guide.id}`,
          contentType: "study_guide",
          contentId: guide.id,
          title: guide.title,
        })),
      ...workspace.quizzes
        .filter((quiz) => !quiz.is_practice)
        .map((quiz) => ({
          value: `quiz:${quiz.id}`,
          contentType: "quiz",
          contentId: quiz.id,
          title: quiz.title,
        })),
    ],
    [workspace],
  );

  const addItem = () => {
    const option = options.find((item) => item.value === selectedContent);
    if (!option || items.some((item) => item.value === option.value)) return;
    setItems((current) => [...current, { ...option, isRequired: true }]);
    setSelectedContent("");
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSave({ title, description, marketId, items, activateAfterSave });
    setTitle("");
    setDescription("");
    setItems([]);
    setActivateAfterSave(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
      <form
        onSubmit={submit}
        className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div>
          <h2 className="text-xl font-semibold">Build a learning path</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Order published guides and official quizzes into a reusable path.
          </p>
        </div>
        <label className="block text-sm font-medium">
          Title
          <input
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="block text-sm font-medium">
          Market scope
          <select
            disabled={isRegionalManager}
            value={marketId}
            onChange={(event) => setMarketId(event.target.value)}
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
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="text-sm font-medium">
            Add content
            <select
              value={selectedContent}
              onChange={(event) => setSelectedContent(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="">Select content</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.contentType === "quiz" ? "Quiz" : "Guide"} ·{" "}
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={addItem}
            className="self-end rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Add
          </button>
        </div>
        <ol className="space-y-2 pl-6">
          {items.map((item, index) => (
            <li
              key={item.value}
              className="rounded-md border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>{item.title}</strong>{" "}
                  <span className="text-xs uppercase text-slate-500">
                    {item.contentType.replace("_", " ")}
                  </span>
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${item.title} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded border px-2 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item.title} down`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded border px-2 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((entry) => entry.value !== item.value),
                      )
                    }
                    className="rounded border px-2 text-red-700 dark:text-red-300"
                  >
                    ×
                  </button>
                </span>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.value === item.value
                          ? { ...entry, isRequired: event.target.checked }
                          : entry,
                      ),
                    )
                  }
                />{" "}
                Required step
              </label>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={activateAfterSave}
              onChange={(event) => setActivateAfterSave(event.target.checked)}
            />{" "}
            Activate immediately
          </label>
          <button
            disabled={saving || items.length === 0}
            className="rounded-md bg-primary px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save learning path"}
          </button>
        </div>
      </form>

      <section
        aria-labelledby="existing-paths-heading"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 id="existing-paths-heading" className="text-xl font-semibold">
          Learning paths
        </h2>
        {workspace.learningPaths.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            No paths have been created.
          </p>
        ) : (
          <ul className="mt-4 list-none space-y-3 p-0">
            {workspace.learningPaths.map((path) => (
              <li
                key={path.id}
                className="rounded-md border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex justify-between gap-3">
                  <strong>{path.title}</strong>
                  <span className="capitalize text-sm">{path.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {path.items.length} step{path.items.length === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default LearningPathComposer;
