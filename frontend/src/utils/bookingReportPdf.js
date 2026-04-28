const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PAGE_MARGIN_X = 48;
const PAGE_MARGIN_TOP = 56;
const PAGE_MARGIN_BOTTOM = 52;
const LINE_HEIGHT = 16;
const BODY_FONT_SIZE = 11;
const TITLE_FONT_SIZE = 18;
const MAX_TEXT_WIDTH = PDF_PAGE_WIDTH - PAGE_MARGIN_X * 2;
const MAX_BODY_CHARS = 92;
const MAX_TITLE_CHARS = 56;
const encoder = new TextEncoder();

function escapePdfText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replaceAll(/[^\x20-\x7E]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function sanitizeFileSegment(value) {
  return String(value ?? "all")
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "") || "all";
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function wrapText(text, maxChars) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [""];
  }

  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxChars) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (word.length <= maxChars) {
      currentLine = word;
      return;
    }

    let remaining = word;
    while (remaining.length > maxChars) {
      lines.push(remaining.slice(0, maxChars - 1) + "-");
      remaining = remaining.slice(maxChars - 1);
    }
    currentLine = remaining;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildReportLines({ bookings, generatedAt, filters }) {
  const lines = [
    { text: "Campus Booking Report", fontSize: TITLE_FONT_SIZE, gapAfter: 10 },
    { text: `Generated: ${formatDateTime(generatedAt)}` },
    {
      text: `Filters: status ${filters.statusLabel}, start ${filters.startLabel}, end ${filters.endLabel}`,
    },
    { text: `Bookings included: ${bookings.length}`, gapAfter: 8 },
  ];

  if (bookings.length === 0) {
    lines.push({
      text: "No bookings matched the selected filters.",
      gapAfter: 8,
    });
    return lines;
  }

  const totals = bookings.reduce(
    (summary, booking) => {
      summary[booking.status] = (summary[booking.status] ?? 0) + 1;
      return summary;
    },
    {},
  );

  lines.push({
    text:
      `Summary: Pending ${totals.PENDING ?? 0}, Approved ${totals.APPROVED ?? 0}, ` +
      `Rejected ${totals.REJECTED ?? 0}, Cancelled ${totals.CANCELLED ?? 0}`,
    gapAfter: 8,
  });

  bookings.forEach((booking, index) => {
    lines.push({
      text: `${index + 1}. ${booking.assetName} (${booking.status})`,
      gapAfter: 2,
    });
    lines.push({ text: `Requested by: ${booking.userName}` });
    lines.push({
      text: `Schedule: ${formatDateTime(booking.startTime)} to ${formatDateTime(booking.endTime)}`,
    });
    lines.push({ text: `Attendees: ${booking.expectedAttendees}` });
    lines.push({ text: `Purpose: ${booking.purpose}` });

    if (booking.rejectionReason) {
      lines.push({ text: `Rejection reason: ${booking.rejectionReason}` });
    }

    lines.push({ text: `Created: ${formatDateTime(booking.createdAt)}`, gapAfter: 8 });
  });

  return lines;
}

function paginateLines(lines) {
  const pages = [];
  let currentPage = [];
  let cursorY = PDF_PAGE_HEIGHT - PAGE_MARGIN_TOP;

  lines.forEach((line) => {
    const fontSize = line.fontSize ?? BODY_FONT_SIZE;
    const maxChars = fontSize > BODY_FONT_SIZE ? MAX_TITLE_CHARS : MAX_BODY_CHARS;
    const wrapped = wrapText(line.text, maxChars);
    const gapAfter = line.gapAfter ?? 0;
    const requiredHeight = wrapped.length * LINE_HEIGHT + gapAfter;

    if (
      currentPage.length > 0 &&
      cursorY - requiredHeight < PAGE_MARGIN_BOTTOM
    ) {
      pages.push(currentPage);
      currentPage = [];
      cursorY = PDF_PAGE_HEIGHT - PAGE_MARGIN_TOP;
    }

    wrapped.forEach((textRow) => {
      currentPage.push({
        text: textRow,
        x: PAGE_MARGIN_X,
        y: cursorY,
        fontSize,
      });
      cursorY -= LINE_HEIGHT;
    });

    cursorY -= gapAfter;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function buildContentStream(pageLines) {
  const commands = ["BT"];
  let currentFontSize = BODY_FONT_SIZE;
  commands.push(`/F1 ${currentFontSize} Tf`);

  pageLines.forEach((line) => {
    if (line.fontSize !== currentFontSize) {
      currentFontSize = line.fontSize;
      commands.push(`/F1 ${currentFontSize} Tf`);
    }

    commands.push(`1 0 0 1 ${line.x} ${line.y} Tm`);
    commands.push(`(${escapePdfText(line.text)}) Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function buildPdfDocument(pages) {
  const objects = [];
  const pageObjectNumbers = [];
  const contentObjectNumbers = [];

  const catalogObjectNumber = 1;
  const pagesObjectNumber = 2;
  const fontObjectNumber = 3;
  let nextObjectNumber = 4;

  pages.forEach((pageLines) => {
    const pageObjectNumber = nextObjectNumber++;
    const contentObjectNumber = nextObjectNumber++;
    pageObjectNumbers.push(pageObjectNumber);
    contentObjectNumbers.push(contentObjectNumber);

    const stream = buildContentStream(pageLines);
    const streamLength = encoder.encode(stream).length;
    objects.push({
      number: contentObjectNumber,
      body: `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`,
    });
  });

  pageObjectNumbers.forEach((pageObjectNumber, index) => {
    objects.push({
      number: pageObjectNumber,
      body:
        `<< /Type /Page /Parent ${pagesObjectNumber} 0 R ` +
        `/MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> ` +
        `/Contents ${contentObjectNumbers[index]} 0 R >>`,
    });
  });

  objects.push({
    number: catalogObjectNumber,
    body: `<< /Type /Catalog /Pages ${pagesObjectNumber} 0 R >>`,
  });
  objects.push({
    number: pagesObjectNumber,
    body:
      `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [` +
      `${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] >>`,
  });
  objects.push({
    number: fontObjectNumber,
    body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  });

  const sortedObjects = [...objects].sort((left, right) => left.number - right.number);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  sortedObjects.forEach((object) => {
    offsets[object.number] = encoder.encode(pdf).length;
    pdf += `${object.number} 0 obj\n${object.body}\nendobj\n`;
  });

  const xrefStart = encoder.encode(pdf).length;
  pdf += `xref\n0 ${sortedObjects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= sortedObjects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${sortedObjects.length + 1} /Root ${catalogObjectNumber} 0 R >>\n` +
    `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function createBookingReportPdf({ bookings, generatedAt, filters }) {
  const lines = buildReportLines({ bookings, generatedAt, filters });
  const pages = paginateLines(lines);
  const blob = buildPdfDocument(pages);
  const fileName =
    `booking-report-${sanitizeFileSegment(filters.statusLabel)}-` +
    `${sanitizeFileSegment(filters.startLabel)}-${sanitizeFileSegment(filters.endLabel)}.pdf`;

  return {
    blob,
    url: URL.createObjectURL(blob),
    fileName,
    previewTitle: `Booking report generated on ${formatDate(generatedAt)}`,
    pageCount: pages.length,
  };
}
