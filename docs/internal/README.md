# Internal Engineering Logs

This directory contains historical logs, decision records, and inventory documents created during the development process.

## Structure

We organize logs by "Phase" to keep history chronological and context-aware.

- **phase-0-audit**: Initial codebase audit and discovery.
- **phase-1-start**: Foundation work and setup.
- **phase-2-marketing**: Marketing website implementation.
- **phase-3a-profitability**: Analytics and data features.
- **phase-3b-settings**: User profile and organization settings.
- **pricing**: Pricing logic and plan synchronization.
- **auth**: Authentication details.

## Adding New Logs

When starting a new major task or phase:

1. Create a new folder: `phase-N-name`
2. Add markdown files inside using kebab-case names.
3. Update `../INDEX.md` to link to the new documents.

## Naming Convention

- Folders: `kebab-case` (e.g., `phase-4-refactor`)
- Files: `kebab-case.md` (e.g., `performance-audit.md`)
