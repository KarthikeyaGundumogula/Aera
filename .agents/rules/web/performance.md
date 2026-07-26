> This file extends [common/patterns.md](../common/patterns.md) with build and runtime performance rules for this app.

# Web Performance Standards

These rules are mandatory for any future agent work that changes React pages, routing, shared UI flows, hooks, or build configuration.

## Primary Goal

Ship the smallest practical initial bundle, avoid duplicated UI logic, and keep runtime state simple enough that the app remains fast after repeated feature work.

## Must Always

- Prefer route-level code splitting for page surfaces.
- Keep the app shell light and lazy-load feature pages.
- Reuse existing flows before creating a second implementation of the same workflow.
- Derive state instead of mirroring props or fetched data into local state unless the UI is intentionally staging edits.
- Clean up browser resources created by the UI, especially `blob:` object URLs, timers, and event listeners.
- Run `npm run build` after meaningful frontend changes and inspect the output for regressions.
- Run `npm run lint` after changes and treat type drift as a blocker.

## Must Never

- Eagerly import every route into the root app when lazy loading is possible.
- Use `useMemo` for side effects, state synchronization, or imperative work.
- Leave duplicate page flows in place when they differ only by small config changes.
- Introduce new `console.log`, `console.warn`, or debug-only production behavior.
- Store dead state, unused toggles, or placeholder state transitions that do not affect rendering.
- Let build artifacts like `dist/` leak back into TypeScript program inputs.

## Routing Rules

- Page components must be lazy-loaded from the router unless there is a strong reason not to.
- Keep shared layout wrappers in the entry bundle; push feature-heavy pages into split chunks.
- When adding a new route, default to `lazy(...)` in the root router.
- If a route is modal-capable, keep the modal behavior but still lazy-load the page component.

## Shared Flow Rules

- If two pages share the same step system, form model, validation path, or submit lifecycle, build one shared flow component and thin wrappers around it.
- Differences like labels, default IDs, redirects, and page copy must be passed as config, not copied into a second page.
- Shared flows must expose typed interfaces. Do not use `any` in form updaters or step props.

## State Rules

- Use `useEffect` for synchronization side effects.
- Use `useMemo` only for derived values.
- Use local mirrored state only when the user can edit a snapshot before saving.
- If local mirrored state is used, document the reason in code or keep the naming explicit, such as `draftProfile` or `localOriginal`.
- Remove state immediately when it does not influence rendering, effects, or event behavior.

## Asset and Resource Cleanup

- Revoke old object URLs when replacing uploaded previews.
- Revoke remaining object URLs on unmount.
- Clear timers created for transient UI state when needed.
- Remove DOM event listeners in cleanup functions.

## Build Hygiene

- `tsconfig.json` must exclude generated output such as `dist` and `node_modules`.
- Build-only tools like `vite` belong in `devDependencies` unless there is a concrete runtime reason otherwise.
- Avoid growing the root bundle with feature-specific data or route-only components.

## Performance Review Checklist

Before marking a frontend task complete:

- [ ] New routes are lazy-loaded from the app router
- [ ] No duplicate flows were added where config would suffice
- [ ] No `any` was introduced into shared UI contracts
- [ ] No `useMemo` side effects or mirrored dead state remain
- [ ] Object URLs and listeners are cleaned up correctly
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Build output was inspected for obvious entry-bundle regressions

## When Refactoring Existing Code

Prioritize these fixes first because they have the highest long-term payoff:

1. Router eager imports
2. Duplicated multi-step flows
3. Oversized page components mixing data, effects, and heavy markup
4. Incorrect hook usage
5. Dead state and debug logging
6. Blob URL leaks and event-listener leaks

## Preferred Outcome

Future agents should optimize for:

- Small initial entry chunks
- Predictable route splitting
- Shared typed workflow primitives
- Minimal redundant state
- Clean production builds with no debug leftovers
