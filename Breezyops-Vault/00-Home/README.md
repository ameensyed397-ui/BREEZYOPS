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
**v0.13** committed (`452ad36`) — Comprehensive bugfix pass: auth hardening (password reset sign-out, forgot-password try-catch, OTP race condition), DB fixes (paid_at column, empty-result mock fallthrough, dashboard lead fields), schedule fixes (week nav ±49d bug, props sync, overlap normalization, URL cleanup), job checklist reset, PDF hex color parsing. Build passes clean. Live at `https://breezyops.vercel.app`. See [[Build-Status]] for live state, [[Changelog]] for version history.
