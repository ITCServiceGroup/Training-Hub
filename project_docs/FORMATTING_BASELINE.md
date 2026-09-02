# Formatting baseline

The repository predates its current Prettier configuration and contains substantial legacy formatting debt. Applying a whole-tree rewrite during security or database work would obscure behavioral review and make rollback unnecessarily difficult.

`npm run format` and `npm run format:check` therefore enforce a named maintenance boundary: CI and configuration, verification scripts, tests, authorization configuration, training-domain code, server-authoritative assessment contracts, template loading, and the active error-boundary code. These paths are the code added or materially maintained by the current roadmap.

When a legacy feature is materially changed, add its stable directory or files to the formatting command and format that scope in the same reviewed change. The maintenance boundary may only expand. It must not be narrowed to make CI pass.

The formatting-baseline and documentation-map files are inside the boundary so changes to the policy itself are also enforced.
