---
name: cli-i18n-discipline
description: Use for any CLI or terminal UI change that adds or changes user-facing text. Enforces that all command output, prompts, errors, progress messages, help text, and status text go through the project's locale system instead of hardcoded strings, and stays compatible when supported languages expand later.
---

# CLI I18n Discipline

Apply this skill whenever a CLI command, terminal UI, wizard, progress view, help screen, error message, or status message is added or changed.

## Core rule

All user-facing CLI text must come from the project's i18n system.

Do not hardcode visible text in commands, Ink components, helpers, services, or workflow code if that text can reach the terminal.

## Scope

This applies to:

- command help text
- prompts and wizard labels
- hints and descriptions
- success and error messages
- progress messages
- empty states
- warnings
- install and setup guidance
- status summaries
- completion text

This does not require translating:

- internal variable names
- file names
- command IDs
- config keys
- external tool raw output that is being passed through as diagnostic data

## Required behavior

- Use the project's locale registry as the source of truth for supported languages.
- Add new message keys to the shared locale key type or schema before using them.
- Add each new key to every supported locale file.
- If a flow needs both "in progress" and "completed" wording, model them as separate i18n keys instead of transforming strings ad hoc.
- If a string contains dynamic values, keep the sentence localized and interpolate only the variable parts.
- Keep visible text out of command orchestration files when practical; prefer locale lookups near rendering or user-message assembly.

## Future-proofing rule

Write changes so the skill still works when more languages are added later.

- Do not write instructions that depend on a fixed language list.
- Do not special-case only today's locales unless there is a temporary, explicit fallback.
- Prefer locale catalogs or typed message maps that fail loudly when a new key is missing.
- When adding a language later, the same message-key structure should make the new locale straightforward to complete.

## Preferred structure

Adapt to the repository, but keep responsibilities separated:

- locale key types or message schema
- locale catalogs per language
- choice-label builders or message formatters
- render code that consumes localized strings
- workflow code that reports stage IDs and data, not hardcoded prose

## Editing checklist

Before finishing, verify:

- No new user-facing CLI string was hardcoded outside the locale system.
- Every new message key exists in all supported locale files.
- Dynamic progress and completion states each use intentional localized text.
- The implementation still works if another language is added later.
- Diagnostics from external tools are either clearly raw passthrough output or wrapped in localized framing text.

## Output expectation

When you finish a CLI text change, be ready to state:

- which new locale keys were added
- which locale files were updated
- whether any raw external output is still intentionally untranslated
