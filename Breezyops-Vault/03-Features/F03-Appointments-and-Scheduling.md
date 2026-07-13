---
tags: [feature]
status: draft
phase: 1
---
# F03 — Appointments & Scheduling

## Purpose
Book, view and dispatch jobs on a calendar + map, routed by locality, respecting technician availability.

## Users / roles
admin, ops (full) · technician (own schedule, read) · b2b_manager (B2B bookings).

## User flows
1. From a qualified lead/deal → **Book** → pick service, date/time, technician, site → creates `appointment` + `job` (scheduled).
2. Dispatcher views day/week calendar + map of the 5 localities → assigns/re-assigns → technician notified.
3. Technician sees their day list (mobile PWA) → taps job → opens work order ([[F04-Jobs-and-Work-Orders]]).

## UI states
- **Empty:** "No appointments today."
- **Loading:** calendar skeleton.
- **Populated:** day/week/month calendar + optional map pins by locality.
- **Error:** double-book conflict warning; save failure toast.
- **Edge:** reschedule cascade (moving one job warns about route impact); customer no-show → mark + reschedule.

## shadcn/ui components
`Calendar`/`DatePicker`, `Popover`, `Sheet` (booking form), `Select` (technician/service), `Badge` (status), `Command` (quick book), `Tabs` (day/week/month).

## Use cases
- Cluster three Koramangala jobs into one afternoon route.
- Emergency slot inserted, pushing a flexible AMC visit.

## Edge cases
- Overlapping bookings for solo technician → conflict guard.
- Slot in a locality far from prior job → travel-time hint.
- Recurring AMC visit auto-lands on the calendar ([[F08-AMC-Subscriptions]]).

## Workflow & automation
- Booking confirmation to customer (WhatsApp/email), consent-checked.
- Reminder to customer T-2h; reminder to technician start-of-day.
- AMC `subscription_visits` auto-populate the calendar.

## Data touched
`appointments`, `jobs`, `profiles`, `localities`, `subscription_visits`.

## Dependencies
[[F04-Jobs-and-Work-Orders]] · [[F08-AMC-Subscriptions]] · [[F11-Followups-and-Automations]]
