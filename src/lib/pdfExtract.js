// Client-side PDF text extraction + debit-row parsing.
// Uses pdfjs-dist to read text from text-based PDFs (no AI / external API needed).
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extract all text from a PDF File/Blob, page by page.
 * @param {Blob|File} file
 * @returns {Promise<string>} concatenated page text
 */
export async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => it.str).join(" "));
  }
  await doc.destroy();
  return pages.join("\n");
}

/**
 * Parse debit-order rows from raw PDF text.
 *
 * Bank debit reports typically list one entry per line with:
 *   reference  account_holder  amount  action_date
 *
 * We look for:
 *   - A reference that looks like an SR member card id (e.g. SR001234, SR-001234, SR 001234)
 *     OR any alphanumeric token followed by a name, a currency amount, and a date.
 *   - Amount: numbers with optional thousands separators / decimal, with or without R/USD prefix.
 *   - Date: dd/mm/yyyy or yyyy-mm-dd.
 *
 * Returns an array of { reference, account_holder, amount, action_date }.
 */
export function parseDebitRows(text) {
  const rows = [];

  // Normalise whitespace per line.
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  // Date patterns: dd/mm/yyyy or dd-mm-yyyy
  const dateRe = /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/;
  // Amount: optional R/$, digits with optional thousands sep and decimal
  const amtRe = /R?\s?(\$?\s?\d{1,3}(?:[ ,]\d{3})*(?:\.\d{2})?|\d+\.\d{2})/;

  // SR reference: SR followed by optional separator and 4+ digits/alphanumerics
  const srRe = /\bSR[-\s]?(\d{4,})\b/i;

  // Generic reference: an alphanumeric token (letters+digits, 4-12 chars) that isn't a date/number
  const genericRefRe = /\b([A-Z]{1,4}[-]?\d{3,})\b/;

  for (const line of lines) {
    // Skip page headers / totals that don't look like individual rows
    if (/^(page|total|summary|date|reference|account)/i.test(line) && line.length < 80) continue;

    const dateMatch = line.match(dateRe);
    if (!dateMatch) continue;

    // Parse the date → yyyy-mm-dd
    let [, d, m, y] = dateMatch;
    if (y.length === 2) y = "20" + y;
    const action_date = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

    // Find an amount on the line — pick the last monetary-looking number
    const amountMatches = [...line.matchAll(new RegExp(amtRe, "g"))];
    if (!amountMatches.length) continue;
    // Take the last match (usually the amount, after the reference/name)
    const rawAmt = amountMatches[amountMatches.length - 1][0];
    const amount = Number(rawAmt.replace(/[^\d.]/g, ""));
    if (!amount || isNaN(amount)) continue;

    // Try SR reference first, then a generic alphanumeric reference
    let reference = null;
    const srMatch = line.match(srRe);
    if (srMatch) {
      reference = "SR" + srMatch[1];
    } else {
      const genMatch = line.match(genericRefRe);
      if (genMatch) reference = genMatch[1].replace(/[-\s]/g, "");
    }
    if (!reference) continue;

    // Account holder: text between reference and the amount, trimmed
    const refIdx = line.indexOf(srMatch ? srMatch[0] : reference);
    const afterRef = line.slice(refIdx + reference.length);
    const amtIdx = afterRef.lastIndexOf(rawAmt);
    let account_holder = afterRef.slice(0, amtIdx).trim().replace(/^[-\s]+|[-\s]+$/g, "");
    // Strip leading/trailing punctuation
    account_holder = account_holder.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");

    rows.push({ reference, account_holder, amount, action_date });
  }

  return rows;
}
