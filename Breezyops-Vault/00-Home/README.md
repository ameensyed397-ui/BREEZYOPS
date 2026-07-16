---
tags: [home, readme]
---
# Breezyops Vault — README

This is an **Obsidian vault**. Open the folder in Obsidian (File → Open Vault → this folder) to get wikilinks, graph view and backlinks. It also reads fine as plain markdown in any editor or on GitHub.

## Conventions
- `[[...]]` wikilinks links connect notes. Hover-preview and backlinks work in Obsidian.
- Frontmatter (`--- tags: ---`) at the top of each note powers search & filtering.
- Feature notes follow [[_Feature-Template]] so every feature is documented the same way.
- `07-Roadmap/Decision-Log.md` records **why** decisions were made — update it as things change.

## Folders
- `00-Home` — index / maps of content
- `01-PRD` — product requirements, personas, scope, metrics
- `02-Architecture` — stack, system design, data model, security, integrations, deployment
- `03-Features` — one note per feature (flows, UI states, use/edge cases)
- `04-Userflows` — end-to-end journeys
- `05-SOPs` — operational runbooks
- `06-Templates` — contract / invoice / quote / comms previews
- `07-Roadmap` — phases, backlog, decision log, gaps
- `08-Project-Memory` — context, glossary, changelog

## Current status
**v0.10** committed (`1bf711b`) — shadcn sidebar with collapsible icon mode, Notion-style day view, avatar profile, logo expansion, dropdown overlap fix, badge consistency, visual hierarchy, new customer booking flow. 16 routes, 0 TS errors, 0 lint warnings, 21 tests passing. See [[Build-Status]] for live state, [[Changelog]] for version history.
