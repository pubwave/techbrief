---
name: code-structure-discipline
description: Use for coding tasks in any repository or language when code quality depends on clear module boundaries, small files, focused functions, and proactive refactoring instead of piling unrelated logic into large mixed-responsibility files.
---

# Code Structure Discipline

Apply this skill on any non-trivial code change where maintainability matters.

## Core rule

Prefer clear structure over local convenience.

Do not solve a task by piling more code into an already-large file when a small module split would make the code easier to read, review, test, and maintain.

## Hard constraints

- Avoid files growing into "dump files".
- Target under `200` lines for normal business files when practical.
- Treat `300` lines as a refactor threshold, not a goal.
- If a file goes beyond `350` lines, split it unless there is a strong technical reason not to.
- Keep functions focused. Prefer small single-purpose functions over long control-flow blocks.
- Separate types, helpers, side effects, views, adapters, state orchestration, transport wiring, and domain logic when they start mixing.

## Required splits

Split code when any of these happen:

- A file contains both UI rendering and side-effect-heavy workflow logic.
- A file contains both domain rules and command-line / HTTP / framework wiring.
- A file contains both data types and behavior-heavy business logic.
- One feature adds a second or third clearly different responsibility to the file.
- A component starts carrying setup flow logic, background process orchestration, and multiple render modes together.
- A module starts mixing storage, network access, parsing, validation, and presentation concerns.
- A file becomes difficult to scan top-to-bottom without jumping between unrelated concepts.

## Preferred structure

Use small modules with obvious ownership. Adapt naming to the language and framework, but keep responsibilities distinct.

Examples by role:

- `types`, `schema`, `dto`: shared data contracts and small pure guards
- `helpers`, `utils`, `formatters`: pure transformation helpers
- `hooks`, `controllers`, `presenters`: stateful orchestration near UI or framework entrypoints
- `views`, `components`, `templates`: render-only or presentation-focused code
- `service`, `manager`, `use-case`, `interactor`: workflow orchestration
- `repository`, `client`, `gateway`, `adapter`: persistence or external-system integration
- `index`, entry file, command file, router file: thin wiring only

Map those patterns to the current stack instead of forcing one naming convention:

- TypeScript / JavaScript: split by module and role
- Python: prefer small modules and packages over large scripts
- Go: keep packages cohesive and files focused by responsibility
- Rust: split by module, trait implementation boundary, and domain responsibility
- Java / Kotlin / Swift / C#: keep class and file ownership narrow; avoid god classes
- Dart / Flutter: separate widgets, state, services, models, and effects
- Backend frameworks: separate routing, handlers/controllers, services, repositories, validators, and schemas
- Frontend frameworks: separate view code, state orchestration, data access, and domain transforms

## Editing behavior

Before adding code to a file, check:

1. Is the file already large?
2. Is the new logic a separate concern?
3. Will this make the file harder to scan end-to-end?

If the answer to any is yes, split first.

## Language-agnostic guidance

Apply the principle, not the filename suffix.

- If the language prefers one type per file, keep classes and structs narrow.
- If the language prefers package-level grouping, keep each file focused within that package.
- If the framework encourages feature folders, keep each feature folder internally separated by concern.
- If the runtime has codegen or framework glue, keep generated or wiring-heavy code isolated from domain logic.

## Review checklist

Before finishing, verify:

- No touched file became a mixed-responsibility file.
- No touched file became unnecessarily large.
- Naming still reflects ownership clearly.
- Shared logic was extracted instead of duplicated.
- The main entry file stayed thin.
- The structure still makes sense for this language and framework.
- A new contributor can identify where to add the next related change.

## Output expectation

When you finish a coding task, be ready to state:

- which files were split
- why the split improved structure
- whether any touched file is still near the refactor threshold
