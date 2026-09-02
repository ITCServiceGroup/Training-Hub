# System template pipeline

System templates are generated payloads, not ordinary hand-maintained application modules. Each payload lives in `src/data/templates`, while `src/data/systemTemplateRegistry.js` contains only searchable metadata and a literal dynamic import for that payload.

## Update procedure

1. Add or update one generated payload in `src/data/templates`.
2. Keep its exported object below 2 MiB and include a `ROOT` content node.
3. Add matching metadata and a loader to `systemTemplateRegistry.js`.
4. Run `npm run source:check`, `npm test`, `npm run build`, and `npm run bundle:check`.
5. Confirm the manifest contains one dynamic entry per production template and that each remains below the compressed template budget.

The runtime loader validates identity, metadata, JSON structure, and size before returning a template. Catalog search loads only registry metadata. Template content is fetched when a preview becomes visible or a template is selected, and failed imports are removed from the cache so a later retry can succeed.
