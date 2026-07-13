import type { Lead } from "./schema";

export const mockLeads: (Lead & { locality?: string })[] = [
  { id: "1", channel: "whatsapp", source: "reactivation", segment: "b2c", name: "Priya K.",
    phone: "+91 98•• ••210", message: "AC not cooling since morning, HSR Layout Sector 2.",
    urgent: true, localityId: null, status: "new", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: new Date(Date.now() + 20 * 60000), lostReason: null,
    createdAt: new Date(Date.now() - 6 * 60000), updatedAt: new Date(), locality: "HSR Layout" },
  { id: "2", channel: "voice", source: "google", segment: "b2c", name: "Rahul S.",
    phone: "+91 96•• ••455", message: "Wants deep clean before guests arrive this weekend.",
    urgent: false, localityId: null, status: "new", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: new Date(Date.now() + 24 * 60000), lostReason: null,
    createdAt: new Date(Date.now() - 22 * 60000), updatedAt: new Date(), locality: "Koramangala" },
  { id: "3", channel: "webform", source: "website", segment: "b2b", name: "Anish M. (Indiranagar office)",
    phone: "+91 80•• ••901", message: "Quarterly VRF maintenance for 3 floors. Do you provide GST invoice?",
    urgent: false, localityId: null, status: "new", aiDisclosed: true, customerId: null,
    assignedTo: null, slaDueAt: null, lostReason: null,
    createdAt: new Date(Date.now() - 90 * 60000), updatedAt: new Date(), locality: "Indiranagar" },
];
