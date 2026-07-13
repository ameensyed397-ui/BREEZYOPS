---
tags: [template, contract]
---
# Contract Template — AMC (Annual Maintenance)

> Merge fields in `{{curly}}`. Rendered to branded PDF via @react-pdf. Preview shown before send ([[F07-Contracts-and-Templates]]).

---

**BREEZYAIR — ANNUAL MAINTENANCE CONTRACT**

**Contract No:** {{contract_number}} · **Date:** {{date}}

**Between:** Breezyair, Bengaluru ("Service Provider") — Contact: {{provider_phone}} · {{provider_email}}
**And:** {{customer_name}}, {{customer_address}} ("Customer") {{#if gstin}}· GSTIN: {{gstin}}{{/if}}

**1. Scope of Services.** The Service Provider will maintain the air-conditioning units listed in Annexure A at the site(s): {{site_list}}. Plan: **{{plan_name}}** including: {{plan_inclusions}}.

**2. Term.** {{start_date}} to {{end_date}} (12 months), renewable by mutual consent.

**3. Visits & Response.** {{visit_count}} scheduled service visits. Emergency response within {{sla_hours}} hours for covered breakdowns. Priority dispatch: {{priority_flag}}.

**4. Fees & Payment.** Annual fee ₹{{annual_fee}} payable {{payment_terms}}. Consumables/spares outside plan entitlements are billed separately at the prevailing rate card.

**5. Exclusions.** Damage from power surges, physical damage, unauthorised third-party repairs, civil/structural work, and unit replacement.

**6. Customer Obligations.** Safe access to units, power and water availability, timely approval of chargeable extras.

**7. Warranty.** Workmanship warranty of {{warranty_days}} days on services performed.

**8. Termination.** Either party may terminate with 30 days' written notice; fees pro-rated for completed visits.

**9. Governing Law.** Courts of Bengaluru, Karnataka.

**Signatures**
Service Provider: ______________  Customer: ______________

**Annexure A — Unit Inventory:** {{unit_table}}
