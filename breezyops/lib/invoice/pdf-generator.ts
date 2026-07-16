import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceTemplate } from "@/lib/db/mock";

type LineItem = { description: string; quantity: number; rate: number; amount: number };

type InvoiceData = {
  number: string;
  type: string;
  customerName: string;
  items: LineItem[];
  subtotal: number;
  gstApplicable: boolean;
  gstRate: number | null;
  gstAmount: number | null;
  total: number;
  issuedAt: Date | null;
  dueAt: Date | null;
  notes: string | null;
  terms: string | null;
  validityDays: number | null;
};

const INR = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
const GSTIN = "29AABCB1234F1Z5";

function drawHeader(doc: jsPDF, data: InvoiceData, template: InvoiceTemplate, w: number) {
  const accent = template.accent;

  if (template.id === "classic") {
    doc.setDrawColor(accent);
    doc.setLineWidth(0.5);
    doc.line(20, 20, w - 20, 20);
    doc.setFontSize(22);
    doc.setTextColor(accent);
    doc.text("BREEZYAIR", 20, 32);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("HVAC & Home Services", 20, 38);
    doc.text(`GSTIN: ${GSTIN}`, 20, 43);
    doc.setFontSize(18);
    doc.setTextColor(accent);
    const label = data.type === "quotation" ? "QUOTATION" : "TAX INVOICE";
    doc.text(label, w - 20, 32, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(data.number, w - 20, 40, { align: "right" });
    doc.line(20, 47, w - 20, 47);
    return 55;
  }

  if (template.id === "modern") {
    doc.setFillColor(accent);
    doc.rect(0, 0, w, 42, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("BREEZYAIR", 20, 20);
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 255);
    doc.text(`HVAC & Home Services  |  GSTIN: ${GSTIN}`, 20, 28);
    doc.setFontSize(18);
    const label = data.type === "quotation" ? "QUOTATION" : "TAX INVOICE";
    doc.text(label, w - 20, 20, { align: "right" });
    doc.setFontSize(10);
    doc.text(data.number, w - 20, 30, { align: "right" });
    doc.setFillColor(245, 245, 250);
    doc.rect(0, 42, w, 3, "F");
    return 52;
  }

  // minimal
  doc.setFontSize(24);
  doc.setTextColor(accent);
  doc.text("BREEZYAIR", 20, 25);
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`HVAC & Home Services  |  GSTIN: ${GSTIN}`, 20, 32);
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(20, 36, w - 20, 36);
  doc.setFontSize(16);
  doc.setTextColor(accent);
  const label = data.type === "quotation" ? "QUOTATION" : "INVOICE";
  doc.text(label, w - 20, 25, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(data.number, w - 20, 33, { align: "right" });
  return 44;
}

function drawPartyBlock(doc: jsPDF, data: InvoiceData, y: number, w: number) {
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text("BILL TO", 20, y);
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(data.customerName, 20, y + 7);

  const rightX = w / 2 + 10;
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text("DATE", rightX, y);
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-IN") : "—", rightX, y + 7);

  if (data.type === "quotation" && data.validityDays) {
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("VALID FOR", rightX + 45, y);
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`${data.validityDays} days`, rightX + 45, y + 7);
  } else if (data.dueAt) {
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("DUE DATE", rightX + 45, y);
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(new Date(data.dueAt).toLocaleDateString("en-IN"), rightX + 45, y + 7);
  }

  return y + 16;
}

function drawTable(doc: jsPDF, data: InvoiceData, y: number, w: number, template: InvoiceTemplate) {
  const body = data.items.map((item, i) => [
    String(i + 1),
    item.description,
    String(item.quantity),
    INR(item.rate),
    INR(item.amount),
  ]);

  const head = [["#", "Description", "Qty", "Rate", "Amount"]];

  const tableStyles: Record<string, any> = {
    styles: { fontSize: 9, cellPadding: 4, textColor: [50, 50, 50] },
    headStyles: { fillColor: template.accent, textColor: [255, 255, 255], fontStyle: "bold" as const },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" as const },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20, halign: "center" as const },
      3: { cellWidth: 35, halign: "right" as const },
      4: { cellWidth: 35, halign: "right" as const },
    },
  };

  if (template.id === "minimal") {
    tableStyles.headStyles = { fillColor: [255, 255, 255], textColor: template.accent, fontStyle: "bold" as const, lineWidth: 0.3, lineColor: [200, 200, 200] };
    tableStyles.alternateRowStyles = {};
    tableStyles.styles = { ...tableStyles.styles, lineColor: [230, 230, 230], lineWidth: 0.1 };
  }

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: 20, right: 20 },
    ...tableStyles,
  });

  return (doc as any).lastAutoTable.finalY;
}

function drawTotals(doc: jsPDF, data: InvoiceData, y: number, w: number) {
  const rightX = w - 20;
  let lineY = y + 6;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Subtotal", rightX - 55, lineY);
  doc.text(INR(data.subtotal), rightX, lineY, { align: "right" });
  lineY += 7;

  if (data.gstApplicable && data.gstRate && data.gstAmount) {
    doc.text(`GST (${data.gstRate}%)`, rightX - 55, lineY);
    doc.text(INR(data.gstAmount), rightX, lineY, { align: "right" });
    lineY += 7;
  }

  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(rightX - 65, lineY, rightX, lineY);
  lineY += 5;

  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", rightX - 55, lineY);
  doc.text(INR(data.total), rightX, lineY, { align: "right" });
  doc.setFont("helvetica", "normal");

  return lineY + 8;
}

function drawFooter(doc: jsPDF, data: InvoiceData, y: number, w: number, template: InvoiceTemplate) {
  const maxY = 270;
  let footerY = Math.max(y + 8, maxY - 40);

  if (data.notes) {
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Notes", 20, footerY);
    doc.setFontSize(9);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(data.notes, w - 40);
    doc.text(lines, 20, footerY + 6);
    footerY += 6 + lines.length * 4 + 4;
  }

  if (data.terms) {
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Terms & Conditions", 20, footerY);
    doc.setFontSize(8);
    doc.setTextColor(100);
    const lines = doc.splitTextToSize(data.terms, w - 40);
    doc.text(lines, 20, footerY + 5);
    footerY += 5 + lines.length * 3.5 + 4;
  }

  if (template.id === "minimal") {
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(20, 282, w - 20, 282);
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text("Breezyair HVAC & Home Services  |  Generated from Breezyair Platform", w / 2, 287, { align: "center" });
  } else {
    doc.setDrawColor(template.accent);
    doc.setLineWidth(0.3);
    doc.line(20, 282, w - 20, 282);
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text("Thank you for your business!", 20, 287);
    doc.text("Breezyair HVAC & Home Services", w - 20, 287, { align: "right" });
  }
}

export function generateInvoicePDF(data: InvoiceData, template: InvoiceTemplate): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  const y1 = drawHeader(doc, data, template, w);
  const y2 = drawPartyBlock(doc, data, y1, w);
  const y3 = drawTable(doc, data, y2, w, template);
  const y4 = drawTotals(doc, data, y3, w);
  drawFooter(doc, data, y4, w, template);

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

export function getPDFDataUri(doc: jsPDF): string {
  return doc.output("datauristring");
}
