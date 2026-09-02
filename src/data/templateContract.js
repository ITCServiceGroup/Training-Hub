const MAX_TEMPLATE_CONTENT_BYTES = 2 * 1024 * 1024;

const nonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const validateSystemTemplate = (template, expectedMetadata = null) => {
  if (!template || typeof template !== "object" || Array.isArray(template)) {
    throw new TypeError("System template must be an object.");
  }

  for (const key of ["id", "name", "description", "category"]) {
    if (!nonEmptyString(template[key])) {
      throw new TypeError(`System template ${key} must be a non-empty string.`);
    }
  }

  if (
    !template.id.startsWith("system-") ||
    template.isSystemTemplate !== true
  ) {
    throw new TypeError("System template identity is invalid.");
  }

  if (
    !Array.isArray(template.tags) ||
    template.tags.length === 0 ||
    !template.tags.every(nonEmptyString)
  ) {
    throw new TypeError(
      "System template tags must be a non-empty string array.",
    );
  }

  if (expectedMetadata) {
    for (const key of ["id", "name", "description", "category"]) {
      if (template[key] !== expectedMetadata[key]) {
        throw new TypeError(
          `System template ${template.id} does not match registry ${key}.`,
        );
      }
    }
  }

  const serialized =
    typeof template.content === "string"
      ? template.content
      : JSON.stringify(template.content);
  if (
    !serialized ||
    new TextEncoder().encode(serialized).byteLength > MAX_TEMPLATE_CONTENT_BYTES
  ) {
    throw new TypeError(
      "System template content is empty or exceeds the 2 MiB limit.",
    );
  }

  let content;
  try {
    content =
      typeof template.content === "string"
        ? JSON.parse(template.content)
        : template.content;
  } catch {
    throw new TypeError("System template content must be valid JSON.");
  }

  if (
    !content ||
    typeof content !== "object" ||
    Array.isArray(content) ||
    !content.ROOT
  ) {
    throw new TypeError("System template content must contain a ROOT node.");
  }

  return template;
};
