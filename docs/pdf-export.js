(function attachPdfExporter(global) {
  "use strict";

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 52;
  const FOOTER_Y = 34;
  const INK = "0.063 0.067 0.059";
  const MUTED = "0.40 0.41 0.38";
  const SIGNAL = "0.784 1 0.239";
  const PAPER = "0.949 0.941 0.914";

  function ascii(value) {
    return String(value ?? "")
      .replace(/[–—−]/g, "-")
      .replace(/[·•]/g, "/")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/↗/g, "up-right")
      .replace(/[^\x20-\x7E]/g, "");
  }

  function pdfEscape(value) {
    return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  function money(value, currency = "USD") {
    const symbol = currency === "USD" ? "$" : `${ascii(currency)} `;
    return `${symbol}${Number(value).toFixed(2)}`;
  }

  function signedPercent(value) {
    const number = Number(value);
    return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
  }

  function sgtParts(date) {
    const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return {
      year: shifted.getUTCFullYear(),
      month: String(shifted.getUTCMonth() + 1).padStart(2, "0"),
      day: String(shifted.getUTCDate()).padStart(2, "0"),
      hour: String(shifted.getUTCHours()).padStart(2, "0"),
      minute: String(shifted.getUTCMinutes()).padStart(2, "0"),
      second: String(shifted.getUTCSeconds()).padStart(2, "0"),
    };
  }

  function formatTimestamp(date) {
    const p = sgtParts(date);
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} SGT (UTC+08:00)`;
  }

  function createFilename(date = new Date()) {
    const p = sgtParts(date);
    return `near-term-signal-${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}-SGT.pdf`;
  }

  function wrapText(value, fontSize, maxWidth) {
    const words = ascii(value).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const maxCharacters = Math.max(12, Math.floor(maxWidth / (fontSize * 0.51)));
    const lines = [];
    let line = "";

    for (const word of words) {
      if (word.length > maxCharacters) {
        if (line) lines.push(line);
        for (let index = 0; index < word.length; index += maxCharacters) {
          lines.push(word.slice(index, index + maxCharacters));
        }
        line = "";
      } else if (!line || `${line} ${word}`.length <= maxCharacters) {
        line = line ? `${line} ${word}` : word;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function textOp(text, x, y, size = 9, font = "F1", color = INK) {
    return `${color} rg BT /${font} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET`;
  }

  function lineOp(x1, y1, x2, y2, width = 0.5, color = "0.72 0.72 0.69") {
    return `${color} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;
  }

  function fillOp(x, y, width, height, color) {
    return `${color} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`;
  }

  function addWrapped(page, value, x, y, options = {}) {
    const size = options.size ?? 9;
    const leading = options.leading ?? size * 1.38;
    const width = options.width ?? PAGE_WIDTH - x - MARGIN;
    const lines = wrapText(value, size, width);
    lines.forEach((line, index) => {
      page.push(textOp(line, x, y - index * leading, size, options.font ?? "F1", options.color ?? INK));
    });
    return y - lines.length * leading;
  }

  function pageHeader(page, label) {
    page.push(fillOp(0, PAGE_HEIGHT - 48, PAGE_WIDTH, 48, INK));
    page.push(textOp("N/", MARGIN, PAGE_HEIGHT - 31, 10, "F2", SIGNAL));
    page.push(textOp("NEAR TERM SIGNAL", MARGIN + 28, PAGE_HEIGHT - 31, 8, "F2", "1 1 1"));
    page.push(textOp(label.toUpperCase(), PAGE_WIDTH - MARGIN - 150, PAGE_HEIGHT - 31, 7, "F1", "0.77 0.77 0.74"));
  }

  function buildCover(screen, savedAt) {
    const page = [];
    pageHeader(page, "Saved research record");
    page.push(textOp("TIMESTAMPED EQUITY SCREEN", MARGIN, 744, 8, "F2", MUTED));
    page.push(textOp("Ten stocks.", MARGIN, 695, 30, "F2", INK));
    page.push(textOp("One reference point.", MARGIN, 658, 30, "F2", INK));
    page.push(fillOp(MARGIN, 620, 92, 7, SIGNAL));

    page.push(textOp("SAVED AT", MARGIN, 574, 7, "F2", MUTED));
    page.push(textOp(formatTimestamp(savedAt), MARGIN, 555, 12, "F2", INK));
    page.push(textOp("MARKET DATA DATE", MARGIN, 516, 7, "F2", MUTED));
    page.push(textOp(ascii(screen.dataDate), MARGIN, 497, 12, "F2", INK));
    page.push(textOp("SCREEN GENERATED", 322, 516, 7, "F2", MUTED));
    page.push(textOp(ascii(screen.generatedAt), 322, 497, 10, "F1", INK));

    page.push(lineOp(MARGIN, 466, PAGE_WIDTH - MARGIN, 466, 0.8, INK));
    page.push(textOp("SCOPE", MARGIN, 438, 7, "F2", MUTED));
    let y = addWrapped(page, screen.universe, MARGIN, 418, { size: 10, leading: 14, width: PAGE_WIDTH - MARGIN * 2 });
    y -= 13;
    page.push(textOp("HORIZON", MARGIN, y, 7, "F2", MUTED));
    page.push(textOp(ascii(screen.horizon), MARGIN, y - 19, 10, "F2", INK));

    page.push(fillOp(MARGIN, 178, PAGE_WIDTH - MARGIN * 2, 112, PAPER));
    page.push(textOp("RESEARCH NOTICE", MARGIN + 18, 264, 7, "F2", MUTED));
    addWrapped(
      page,
      "This document is structured research, not personal financial advice. Forecasts are uncertain scenarios, not guaranteed outcomes. Verify current prices, catalysts, fundamentals, and suitability independently before relying on this record.",
      MARGIN + 18,
      243,
      { size: 9, leading: 13, width: PAGE_WIDTH - MARGIN * 2 - 36 },
    );
    return page;
  }

  function buildOverview(screen) {
    const page = [];
    pageHeader(page, "Ranked overview");
    page.push(textOp("RANKED OVERVIEW", MARGIN, 755, 20, "F2", INK));
    page.push(textOp(`Data date ${ascii(screen.dataDate)} / ${ascii(screen.horizon)}`, MARGIN, 730, 8, "F1", MUTED));
    page.push(lineOp(MARGIN, 708, PAGE_WIDTH - MARGIN, 708, 0.8, INK));

    const columns = [MARGIN, 82, 205, 291, 382, 468];
    ["RANK", "STOCK", "CURRENT", "TARGET RANGE", "WEIGHTED", "RETURN"].forEach((label, index) => {
      page.push(textOp(label, columns[index], 688, 6.5, "F2", MUTED));
    });

    let y = 656;
    for (const stock of screen.results) {
      const currency = stock.currency || "USD";
      page.push(textOp(String(stock.rank).padStart(2, "0"), columns[0], y, 8, "F1", MUTED));
      page.push(textOp(`${stock.ticker} / ${stock.company}`, columns[1], y, 8.5, "F2", INK));
      page.push(textOp(money(stock.currentPrice, currency), columns[2], y, 8.5, "F1", INK));
      page.push(textOp(`${money(stock.targetRange[0], currency)}-${money(stock.targetRange[1], currency)}`, columns[3], y, 8.5, "F1", INK));
      page.push(textOp(money(stock.weightedTarget, currency), columns[4], y, 8.5, "F2", INK));
      page.push(textOp(signedPercent(stock.impliedReturn), columns[5], y, 8.5, "F2", stock.impliedReturn >= 0 ? "0.21 0.42 0.07" : "0.63 0.24 0.17"));
      page.push(lineOp(MARGIN, y - 18, PAGE_WIDTH - MARGIN, y - 18));
      y -= 50;
    }

    page.push(textOp("RANKING NOTE", MARGIN, 126, 7, "F2", MUTED));
    addWrapped(page, "Rank reflects probability-weighted expected return adjusted for the screen's risk and signal inputs. Company quality and near-term stock attractiveness are different questions.", MARGIN, 108, { size: 8.5, leading: 12 });
    return page;
  }

  function stockBlock(page, stock, topY) {
    const currency = stock.currency || "USD";
    page.push(fillOp(MARGIN, topY - 21, 30, 22, SIGNAL));
    page.push(textOp(String(stock.rank).padStart(2, "0"), MARGIN + 8, topY - 15, 8, "F2", INK));
    page.push(textOp(`${stock.ticker} / ${stock.company}`, MARGIN + 42, topY - 14, 14, "F2", INK));
    page.push(textOp(`${stock.exchange} / ${stock.sector}`, MARGIN + 42, topY - 30, 7, "F1", MUTED));

    let y = topY - 60;
    const entry = `${money(stock.entryReferenceZone[0], currency)}-${money(stock.entryReferenceZone[1], currency)}`;
    const targets = `${money(stock.targetRange[0], currency)}-${money(stock.targetRange[1], currency)}`;
    page.push(textOp(`Current ${money(stock.currentPrice, currency)}`, MARGIN, y, 8.5, "F2", INK));
    page.push(textOp(`Entry reference ${entry}`, 170, y, 8.5, "F1", INK));
    page.push(textOp(`Target range ${targets}`, 326, y, 8.5, "F1", INK));
    y -= 18;
    page.push(textOp(`Weighted ${money(stock.weightedTarget, currency)} / ${signedPercent(stock.impliedReturn)}`, MARGIN, y, 8.5, "F2", INK));
    page.push(textOp(`${stock.setup} / ${stock.confidence} confidence / ${stock.risk} risk`, 224, y, 8.5, "F1", INK));
    y -= 25;

    page.push(textOp("SCENARIOS", MARGIN, y, 6.5, "F2", MUTED));
    y -= 16;
    for (const scenario of stock.scenarios) {
      page.push(textOp(`${scenario.name} ${scenario.probability}% / ${money(scenario.target, currency)}`, MARGIN, y, 8, "F2", INK));
      y = addWrapped(page, scenario.logic, 181, y, { size: 7.5, leading: 10, width: PAGE_WIDTH - MARGIN - 181 });
      y -= 4;
    }

    page.push(textOp("WHAT APPEARS PRICED IN", MARGIN, y - 2, 6.5, "F2", MUTED));
    y = addWrapped(page, stock.pricedIn, MARGIN, y - 17, { size: 7.8, leading: 10.5 });
    y -= 4;
    page.push(textOp("KEY SIGNALS", MARGIN, y, 6.5, "F2", MUTED));
    y -= 14;
    for (const driver of stock.drivers) {
      y = addWrapped(page, `- ${driver}`, MARGIN, y, { size: 7.8, leading: 10.5 });
    }
    y -= 2;
    page.push(textOp("INVALIDATION", MARGIN, y, 6.5, "F2", MUTED));
    y = addWrapped(page, stock.invalidation, MARGIN, y - 14, { size: 7.8, leading: 10.5 });
    y -= 2;
    page.push(textOp(`Source: ${stock.sourceUrl}`, MARGIN, y, 6.8, "F1", MUTED));
    return y - 14;
  }

  function buildStockPages(screen) {
    const pages = [];
    for (let index = 0; index < screen.results.length; index += 2) {
      const page = [];
      pageHeader(page, `Detailed scenarios ${index + 1}-${Math.min(index + 2, screen.results.length)}`);
      let y = 762;
      y = stockBlock(page, screen.results[index], y);
      page.push(lineOp(MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.9, INK));
      stockBlock(page, screen.results[index + 1], y - 24);
      pages.push(page);
    }
    return pages;
  }

  function buildMethodPage(screen, savedAt) {
    const page = [];
    pageHeader(page, "Method and limitations");
    page.push(textOp("METHOD & LIMITATIONS", MARGIN, 755, 20, "F2", INK));
    let y = 714;
    const sections = [
      ["METHOD", screen.methodology],
      ["DATA LIMITATIONS", screen.limitations],
      ["INTERPRETATION", "Near-term movement is driven by changes in market expectations, not company quality alone. Scenario targets combine observed price behavior, signal strength, downside risk, and probability weights. The probability-weighted target is not a promise of the future price."],
      ["DOWNSIDE DISCIPLINE", "Each stock includes a bear case and a stated invalidation level. A break below that level, a material adverse catalyst, or stale source data should trigger a fresh research pass rather than reliance on this saved screen."],
      ["ARCHIVE LABEL", `Saved at ${formatTimestamp(savedAt)}. Market data date ${screen.dataDate}. Screen generated ${screen.generatedAt}.`],
    ];

    for (const [label, content] of sections) {
      page.push(textOp(label, MARGIN, y, 7, "F2", MUTED));
      y = addWrapped(page, content, MARGIN, y - 20, { size: 9, leading: 13 });
      y -= 25;
      page.push(lineOp(MARGIN, y + 10, PAGE_WIDTH - MARGIN, y + 10));
    }

    page.push(fillOp(MARGIN, 90, PAGE_WIDTH - MARGIN * 2, 70, PAPER));
    page.push(textOp("IMPORTANT", MARGIN + 18, 136, 7, "F2", MUTED));
    addWrapped(page, "This archived screen is for future reference only. Prices and circumstances can change after the timestamp. Re-run the screen and verify live sources before drawing a current conclusion.", MARGIN + 18, 118, { size: 8.5, leading: 12, width: PAGE_WIDTH - MARGIN * 2 - 36 });
    return page;
  }

  function serializePdf(pages, savedAt) {
    pages.forEach((page, index) => {
      page.push(lineOp(MARGIN, 53, PAGE_WIDTH - MARGIN, 53));
      page.push(textOp("NEAR TERM SIGNAL / TIMESTAMPED RESEARCH RECORD", MARGIN, FOOTER_Y, 6.5, "F1", MUTED));
      page.push(textOp(`PAGE ${index + 1} OF ${pages.length}`, PAGE_WIDTH - MARGIN - 72, FOOTER_Y, 6.5, "F2", MUTED));
    });

    const objects = new Map();
    objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
    objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

    const pageObjectNumbers = [];
    let objectNumber = 5;
    for (const page of pages) {
      const content = `${page.join("\n")}\n`;
      const contentNumber = objectNumber++;
      const pageNumber = objectNumber++;
      objects.set(contentNumber, `<< /Length ${content.length} >>\nstream\n${content}endstream`);
      objects.set(pageNumber, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNumber} 0 R >>`);
      pageObjectNumbers.push(pageNumber);
    }

    objects.set(2, `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pages.length} >>`);
    const p = sgtParts(savedAt);
    const infoNumber = objectNumber++;
    objects.set(infoNumber, `<< /Title (Near Term Signal - Timestamped Stock Screen) /Creator (Near Term Signal) /CreationDate (D:${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}+08'00') >>`);

    let output = "%PDF-1.4\n";
    const offsets = [0];
    for (let number = 1; number < objectNumber; number += 1) {
      offsets[number] = output.length;
      output += `${number} 0 obj\n${objects.get(number)}\nendobj\n`;
    }
    const xrefOffset = output.length;
    output += `xref\n0 ${objectNumber}\n0000000000 65535 f \n`;
    for (let number = 1; number < objectNumber; number += 1) {
      output += `${String(offsets[number]).padStart(10, "0")} 00000 n \n`;
    }
    output += `trailer\n<< /Size ${objectNumber} /Root 1 0 R /Info ${infoNumber} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return new TextEncoder().encode(output);
  }

  function buildPdf(screen, savedAt = new Date()) {
    if (!screen || !Array.isArray(screen.results) || screen.results.length !== 10) {
      throw new Error("A complete ten-stock screen is required for PDF export.");
    }
    const pages = [
      buildCover(screen, savedAt),
      buildOverview(screen),
      ...buildStockPages(screen),
      buildMethodPage(screen, savedAt),
    ];
    return serializePdf(pages, savedAt);
  }

  function downloadPdf(screen, savedAt = new Date()) {
    const bytes = buildPdf(screen, savedAt);
    const filename = createFilename(savedAt);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return filename;
  }

  global.NearTermPdf = { buildPdf, createFilename, downloadPdf, formatTimestamp };
})(globalThis);
