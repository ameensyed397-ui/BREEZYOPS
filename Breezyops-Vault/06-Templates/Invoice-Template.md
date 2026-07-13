---
tags: [template, invoice]
---
# Invoice Template (pre-GST, GST-ready)

Layout spec for the @react-pdf renderer ([[F09-Invoicing-and-Payments]]).

## Layout
- **Header:** Breezyair mascot + wordmark (Sky Blue #14B5F8), "Premium Cooling Services", service areas line, phone + email. Right: **INVOICE**, number `BRZ-{{FY}}-{{seq}}`, dates (issued/due).
- **Bill to:** {{customer_name}}, {{address}} {{#if gstin}}· GSTIN {{gstin}}{{/if}} {{#if po_number}}· PO {{po_number}}{{/if}}
- **Line items table:** description · qty · rate · amount. Doodle-style dividers per brand.
- **Totals block:** Subtotal → {{#if gst_applicable}}CGST {{rate/2}}% + SGST {{rate/2}}% (or IGST){{/if}} → **Total ₹{{total}}**.
- **Payment box:** UPI ID + QR, Razorpay link, bank transfer details.
- **Footer:** warranty note, "Filter coffee is on us ☕", thank-you line, `hello@breezyair.co`.

## Rules
- Pre-GST: GST block hidden entirely; footer note "Not a GST invoice — Breezyair is currently unregistered under GST."
- Post-GST flip: GSTIN in header, GST block renders, note removed. No template fork — one template, conditional blocks.
- Numbering: sequential per financial year, never reused, voids keep their number.
