---
tags: [roadmap, gaps]
---
# Gaps & Open Questions — "what you might be missing"

Things NOT in the original ask that materially affect the build. Each has a recommendation.

## 1. Offline reality for field work ⚠️ (addressed in design)
Rooftops, basements, parking garages = dead zones. If the checklist/photo flow needs live signal, it fails exactly where it's used. **Built in:** offline queue + sync in [[F04-Jobs-and-Work-Orders]]. Don't cut this for time.

## 2. Consent & TRAI/DND is a feature, not a footnote ⚠️ (addressed)
Reactivation broadcasts without consent tracking risk WhatsApp number bans — which would kill the primary channel. **Built in:** `consents` table + hard gate + quiet hours ([[F11-Followups-and-Automations]], [[SOP-Data-and-Consent]]).

## 3. The GST trap on B2B (addressed)
Commercial clients often need GST invoices for input credit. Pre-GST status silently caps winnable B2B deals. **Built in:** `gst_required` captured at qualify + hard warning before quote send. **Open question:** at what B2B pipeline value does voluntary GST registration make sense? (Take to a CA.)

## 4. Data migration plan (open)
Existing customers/jobs live in Notion + Zoho + Asad's phone. Phase 1 needs a one-time import script (CSV → `customers`, `jobs` history) or the reactivation goldmine starts empty. **Recommend:** build the importer in week 2.

## 5. Invoice legal review (open)
In-house invoices must satisfy Indian invoice requirements (even pre-GST: serial number, date, supplier details, description, amount). **Recommend:** one-time CA review of [[Invoice-Template]] before retiring Zoho.

## 6. Backups & the "ours" promise (addressed)
Owning your data means owning its loss. Daily `pg_dump` export to independent storage + quarterly restore drill ([[SOP-Data-and-Consent]]).

## 7. Payment edge: cash reality (addressed)
A chunk of B2C will be cash. The flow records cash at collection time — but reconciliation discipline is an SOP problem, not a software one ([[SOP-Payment-Collection]]).

## 8. Who maintains this? (open)
Custom software = Syed is now the vendor. Agree a support arrangement with Asad (response expectations, change requests) so this doesn't become unpaid infinite scope. **Recommend:** a one-page maintenance agreement — use [[Contract-Template-Service]] as the base, ironically.

## 9. Single-point-of-failure phone number (open)
Leads, OTPs and WhatsApp all hinge on one number. Document recovery (Meta business verification, Exotel fallback routing).

## 10. Warranty tracking (addressed lightly)
`jobs.warranty_until` exists; surface "under warranty" prominently on repeat visits to avoid re-charging covered work.

## 11. Notifications strategy (open)
v1 uses WhatsApp/email for staff alerts. PWA push notifications are flaky on iOS. **Recommend:** WhatsApp-to-staff as the reliable alert channel; revisit push in Phase 3.

## 12. Testing & staging discipline (open)
Real money + real customers → don't test in prod. The `dev` Supabase project + PR previews exist ([[Environments-and-Deployment]]); actually use them.
