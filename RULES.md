# Rules

## Must Always
- Study the global skill folder (`~/.agents/skills`) at the start of the conversation and whenever skills are mentioned.
- Delegate to specialized agents for domain tasks.
- Write tests before implementation and verify critical paths.
- Validate inputs and keep security checks intact.
- Prefer immutable updates over mutating shared state.
- Follow established repository patterns before inventing new ones.
- Keep contributions focused, reviewable, and well-described.


## Must Never
- Include sensitive data such as API keys, tokens, secrets, or absolute/system file paths in output.
- Submit untested changes.
- Bypass security checks or validation hooks.
- Duplicate existing functionality without a clear reason.
- Ship code without checking the relevant test suite.
- Test anything using browser sub agent unless i tell you to do so
- Stage or commit changes (`git add`, `git commit`) without explicit user permission.

## Agent Format
- Agents live in `agents/*.md`.
- Each file includes YAML frontmatter with `name`, `description`, `tools`.
- File names are lowercase with hyphens and must match the agent name.
- Descriptions must clearly communicate when the agent should be invoked.

## Skill Format
- Skills live in `agents/skills/<name>.md`.
- Each skill includes YAML frontmatter with `name`, `description`.
- Use `origin: ECC` for first-party skills and `origin: community` for imported/community skills.
- Skill bodies should include practical guidance, tested examples, and clear "When to Use" sections.

1. **Mock Data**: If you are creating any mock data always create that in the src/mock folder and create a different file for each type of data. 
2. **Context**: Context from the previous works is stored in the `agents/context` folder reference that for better decision making.
3. **Design Quality (Web)**: Do not ship generic templates. Frontend must have clear hierarchy, intentional typography, depth/layering, and avoid uniform padding everywhere. Use the `agents/rules/web/design-quality.md` as a strict checklist.
4. **Patterns (Web)**: Use compound components, url-as-state, and separate server/client state perfectly. Follow `agents/rules/web/patterns.md`.
5. **Performance (Web)**: All frontend work must follow the build and runtime optimization rules in `agents/rules/web/performance.md`. Treat route-level lazy loading, duplicate-flow consolidation, hook correctness, and build verification as mandatory.
6. **Coding Style (TypeScript)**: Strictly avoid `any`, strongly type all public APIs or component props, prefer immutable updates, and use standard error handling. See `agents/rules/typescript/coding-style.md`.
7. **Refactoring & Cleaning**: Read and rely on `agents/refactor-cleaner.md` guidelines for dead-code elimination, duplicate elimination, and keeping the codebase pristine. Do not hesitate to rename or refactor components/patterns if they don't match functionality or flow.
8. **Code Review**: Whenever a code review is requested, strictly follow the protocols, checklists, and severity levels defined in `agents/rules/common/code-review.md`. Ensure all mandatory triggers are met before completion.
9. **Image Alignment**: Always ensure images (`img` tags) use `object-cover object-top`. Images must be attached to the top of their container, and any necessary cropping should happen only at the bottom. This is a platform-wide cinematic design requirement.
