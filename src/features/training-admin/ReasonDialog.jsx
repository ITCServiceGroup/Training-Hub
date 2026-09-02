import { useEffect, useRef, useState } from "react";

const ReasonDialog = ({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab") return;

      const focusable = [
        ...(dialogRef.current?.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ) || []),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      setReason("");
      previouslyFocused?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onCancel()
      }
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reason-dialog-title"
        aria-describedby="reason-dialog-description"
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <h2 id="reason-dialog-title" className="text-xl font-semibold">
          {title}
        </h2>
        <p
          id="reason-dialog-description"
          className="mt-2 text-sm text-slate-600 dark:text-slate-300"
        >
          {description}
        </p>
        <label className="mt-4 block text-sm font-medium">
          Reason
          <textarea
            ref={inputRef}
            rows={4}
            minLength={10}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={reason.trim().length < 10}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ReasonDialog;
