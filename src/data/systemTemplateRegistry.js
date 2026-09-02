const definition = (metadata, load) =>
  Object.freeze({
    ...metadata,
    isSystemTemplate: true,
    load,
  });

export const systemTemplateRegistry = Object.freeze([
  definition(
    {
      id: "system-interactive-learning",
      name: "Interactive Learning",
      description:
        "Template with interactive elements, collapsible sections, and engaging components for dynamic learning",
      category: "Interactive",
      tags: ["interactive", "collapsible", "advanced"],
    },
    () =>
      import("./templates/interactive-learning.js").then(
        (module) => module.interactiveLearningTemplate,
      ),
  ),
  definition(
    {
      id: "system-comparison-layout",
      name: "Comparison Layout",
      description:
        "Perfect for comparing different concepts, products, or approaches side by side",
      category: "Layout",
      tags: ["comparison", "layout", "analysis", "side-by-side"],
    },
    () =>
      import("./templates/comparison-layout.js").then(
        (module) => module.comparisonLayoutTemplate,
      ),
  ),
  ...[
    ["01", "one"],
    ["02", "two"],
    ["03", "three"],
    ["04", "four"],
    ["05", "five"],
  ].map(([number, suffix]) =>
    definition(
      {
        id: `system-signature-${number}`,
        name: `${number} - Signature Template`,
        description:
          "Part of the Signature Series - A professionally designed template with a distinctive layout",
        category: "Signature Series",
        tags: ["signature-series", "professional", "system"],
      },
      () =>
        import(`./templates/signature-template-${suffix}.js`).then(
          (module) =>
            module[
              `signatureTemplate${suffix[0].toUpperCase()}${suffix.slice(1)}`
            ],
        ),
    ),
  ),
  ...[
    ["01", "one"],
    ["02", "two"],
    ["03", "three"],
    ["04", "four"],
    ["05", "five"],
  ].map(([number, suffix]) =>
    definition(
      {
        id: `system-google-inspired-${number}`,
        name: `${number} - Google Inspired Template`,
        description:
          "Part of the Google Inspired Series - A modern template inspired by Google's design principles",
        category: "Google Inspired Series",
        tags: ["google-inspired-series", "modern", "system"],
      },
      () =>
        import(`./templates/google-inspired-template-${suffix}.js`).then(
          (module) =>
            module[
              `googleInspiredTemplate${suffix[0].toUpperCase()}${suffix.slice(1)}`
            ],
        ),
    ),
  ),
]);

export const getSystemTemplateDefinition = (id) =>
  systemTemplateRegistry.find((template) => template.id === id) || null;
