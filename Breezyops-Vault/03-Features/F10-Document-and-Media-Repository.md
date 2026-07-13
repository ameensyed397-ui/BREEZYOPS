---
tags: [feature]
status: draft
phase: 1
---
# F10 — Document & Media Repository

## Purpose
One owned repository for every file: contracts, invoices, quotes, reports, SOP PDFs — and **job photos auto-organised into per-client folders by category** (before / after / issue).

## Users / roles
admin, ops (full) · b2b_manager (B2B accounts) · technician (upload to own jobs; read own-job folders only) · finance (invoices/contracts view).

## User flows
1. **Automatic filing:** photos from [[F04-Jobs-and-Work-Orders]] land at `client-media/{customer_id}/photos/{job_id}/{category}/`; generated PDFs (invoice/quote/contract) land under `documents/{customer_id}/{type}/`.
2. **Browse:** open a customer → Docs / Photos tabs → folder tree by job & category → lightbox preview.
3. **Manual upload:** drag-drop with type + entity link (customer, job, contract).
4. **Global library:** search across all documents by type, customer, date; SOPs & blank templates live in a shared `library/` space.

## UI states
- **Empty:** "No files yet — photos and PDFs will appear here automatically."
- **Loading:** grid skeletons.
- **Populated:** folder tree + thumbnail grid, category chips (before/after/issue), file table for documents.
- **Error:** upload failure → retry queue (mirrors offline handling in F04).
- **Edge:** oversized upload → client-side compression for photos; unsupported type rejected with hint.

## shadcn/ui components
`Tabs` (Docs/Photos), `Breadcrumb` (folder path), `Card`/grid, `Dialog` (lightbox), `Command` (search), `Badge` (category), `DropdownMenu` (download/move/delete), `ScrollArea`.

## Use cases
- Dispute: pull up the exact before/after set for a job in seconds.
- Content engine: filter last week's best after-photos for the IG carousel.
- B2B audit: hand the facility manager a folder of all service reports for their sites.

## Edge cases
- Photo uploaded to wrong job → move with audit entry.
- Customer soft-deleted → files retained (legal/audit), hidden from normal browse.
- Signed URLs expire → regenerate transparently on view.
- Storage quota nearing free-tier cap → admin alert + archival policy prompt.

## Workflow & automation
- Auto-filing on every job close and PDF generation.
- Nightly orphan check (files without DB rows) → admin report.

## Data touched
`documents`, `media`, `customers`, `jobs`, Supabase Storage buckets + storage RLS.

## Dependencies
[[F04-Jobs-and-Work-Orders]] · [[F09-Invoicing-and-Payments]] · [[F07-Contracts-and-Templates]]
