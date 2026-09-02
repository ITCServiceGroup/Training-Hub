const SAFE_EVENT_NAME = /^[a-z][a-z0-9_.-]{2,80}$/;
const SAFE_CORRELATION_ID = /^[a-zA-Z0-9-]{8,80}$/;
const SAFE_ERROR_TYPES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "URIError",
  "AggregateError",
]);

export function createCorrelationId() {
  return globalThis.crypto?.randomUUID?.() || `error-${Date.now()}`;
}

export function buildSafeErrorEvent(eventName, error, correlationId) {
  const safeEventName = SAFE_EVENT_NAME.test(eventName)
    ? eventName
    : "application.error";

  return Object.freeze({
    event: safeEventName,
    correlationId:
      typeof correlationId === "string" &&
      SAFE_CORRELATION_ID.test(correlationId)
        ? correlationId
        : createCorrelationId(),
    errorType: SAFE_ERROR_TYPES.has(error?.name) ? error.name : "Error",
    occurredAt: new Date().toISOString(),
  });
}

export function reportSafeError(eventName, error, correlationId) {
  const telemetryEvent = buildSafeErrorEvent(eventName, error, correlationId);

  // The production bundle removes console diagnostics. Until an approved,
  // access-controlled telemetry sink exists, retain only a redacted local
  // development signal and never persist it in browser storage.
  if (import.meta.env.DEV) {
    console.error("Training Hub diagnostic", telemetryEvent);
  }

  return telemetryEvent;
}
