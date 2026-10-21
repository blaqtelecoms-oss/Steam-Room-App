import { jsPDF } from "jspdf";

const NAVY = [30, 41, 77];
const STRIPE = [244, 246, 251];
const BORDER = [210, 214, 230];
const MARGIN = 14;
const ROW_H = 8;

const fit = (doc, text, width) => {
  let s = String(text ?? "—");
  if (doc.getTextWidth(s) <= width - 3) return s;
  while (s.length > 1 && doc.getTextWidth(s + "…") > width - 3) s = s.slice(0, -1);
  return s + "…";
};

function drawHeaderRow(doc, y, cols) {
  let x = MARGIN;
  doc.setFillColor(...NAVY);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  cols.forEach((c) => {
    doc.rect(x, y, c.w, ROW_H, "F");
    doc.text(c.label, x + 2, y + 5.3);
    x += c.w;
  });
  doc.setTextColor(30, 30, 30);
}

function drawTable(doc, startY, cols, rows) {
  const pageH = doc.internal.pageSize.getHeight();
  let y = startY;
  drawHeaderRow(doc, y, cols);
  y += ROW_H;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  rows.forEach((row, i) => {
    if (y + ROW_H > pageH - 16) {
      doc.addPage();
      y = 16;
      drawHeaderRow(doc, y, cols);
      y += ROW_H;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    let x = MARGIN;
    cols.forEach((c, j) => {
      if (i % 2 === 1) {
        doc.setFillColor(...STRIPE);
        doc.rect(x, y, c.w, ROW_H, "F");
      }
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(x, y, c.w, ROW_H);
      doc.setTextColor(30, 30, 30);
      doc.text(fit(doc, row[j], c.w), x + 2, y + 5.3);
      x += c.w;
    });
    y += ROW_H;
  });
  return y;
}

function sectionTitle(doc, y, text) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + 24 > pageH - 16) {
    doc.addPage();
    y = 16;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(text, MARGIN, y);
  return y + 4;
}

export function buildFinancePdf({ stats, overdueMembers, filtered, getName, getCard, getPhone, periodLabel, statusLabel }) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("SR FITS FINANCE REPORT", pageW / 2, 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${periodLabel}  |  Status: ${statusLabel}  |  Generated: ${now.toLocaleString("en-ZA")}`, pageW / 2, 25, { align: "center" });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Total records:`, MARGIN, 34);
  doc.setFont("helvetica", "normal");
  doc.text(`${filtered.length}`, MARGIN + 24, 34);

  // Block 1: summary
  let y = sectionTitle(doc, 42, "SUMMARY");
  y = drawTable(
    doc,
    y,
    [
      { label: "Total Collected", w: 67 },
      { label: "Outstanding", w: 67 },
      { label: "This Month", w: 67 },
      { label: "Overdue Members", w: 68 },
    ],
    [[
      `R ${stats.collected.toFixed(2)}`,
      `R ${stats.outstanding.toFixed(2)}`,
      `R ${stats.monthCollected.toFixed(2)}`,
      String(stats.overdueCount),
    ]]
  );

  // Block 2: overdue members
  if (overdueMembers.length > 0) {
    y = sectionTitle(doc, y + 10, `OVERDUE MEMBERS (${overdueMembers.length})`);
    y = drawTable(
      doc,
      y,
      [
        { label: "Member", w: 90 },
        { label: "Card ID", w: 40 },
        { label: "Unpaid Count", w: 35 },
        { label: "Total Owed", w: 40 },
        { label: "Phone", w: 64 },
      ],
      overdueMembers.map((om) => [om.name, om.card_id || "—", om.count, `R ${om.total.toFixed(2)}`, om.phone || "No phone"])
    );
  }

  // Block 3: all payments
  y = sectionTitle(doc, y + 10, `ALL PAYMENTS (${filtered.length})`);
  drawTable(
    doc,
    y,
    [
      { label: "Member", w: 62 },
      { label: "Card ID", w: 30 },
      { label: "Description", w: 62 },
      { label: "Amount", w: 26 },
      { label: "Date", w: 30 },
      { label: "Status", w: 26 },
      { label: "Phone", w: 33 },
    ],
    filtered.map((p) => [
      getName(p),
      getCard(p) || "—",
      p.description || "Membership",
      `R ${Number(p.amount || 0).toFixed(2)}`,
      String(p.date || p.due_date || (p.created_date || "").slice(0, 10) || "—").slice(0, 10),
      p.status,
      getPhone(p) || "—",
    ])
  );

  const pages = doc.internal.getNumberOfPages();
  const pageH = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("SR FITS | Finance Report", MARGIN, pageH - 8);
    doc.text(`Page ${i} of ${pages}`, pageW - MARGIN, pageH - 8, { align: "right" });
  }
  return doc;
}