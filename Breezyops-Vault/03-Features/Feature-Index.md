---
tags: [feature, moc]
---
# Feature Index

Every feature is documented with flows, UI states, use cases and edge cases using [[_Feature-Template]].

| # | Feature | Segment | Phase |
|---|---|---|---|
| F01 | [[F01-Unified-Lead-Inbox]] | Both | 1 |
| F02 | [[F02-Lead-Pipeline]] | Both (split boards) | 1 |
| F03 | [[F03-Appointments-and-Scheduling]] | Both | 1 |
| F04 | [[F04-Jobs-and-Work-Orders]] | Both | 1 |
| F05 | [[F05-Customers-and-Accounts]] | Both | 1 |
| F06 | [[F06-Quotes-and-Proposals]] | B2B | 2 |
| F07 | [[F07-Contracts-and-Templates]] | B2B + AMC | 2 |
| F08 | [[F08-AMC-Subscriptions]] | Both | 2 |
| F09 | [[F09-Invoicing-and-Payments]] | Both | 1 |
| F10 | [[F10-Document-and-Media-Repository]] | Both | 1 |
| F11 | [[F11-Followups-and-Automations]] | Both | 2 |
| F12 | [[F12-Reports-and-Analytics]] | Both | 2 |
| F13 | [[F13-Admin-RBAC-Settings]] | System | 1 |

## Cross-cutting
Every feature writes to [[Data-Model|activity_log]], respects [[RBAC-and-Security]], and (where it sends comms) checks `consents`.
