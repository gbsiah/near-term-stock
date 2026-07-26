const runButton = document.querySelector("#run-screen");
const readyState = document.querySelector("#ready-state");
const loadingState = document.querySelector("#loading-state");
const resultsSection = document.querySelector("#ranked-results");
const resultsList = document.querySelector("#results-list");
const errorMessage = document.querySelector("#error-message");
const exportButton = document.querySelector("#export-pdf");
const exportStatus = document.querySelector("#export-status");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
let lastScreen = null;

document.querySelector(".scan-lines").innerHTML = Array.from(
  { length: 10 },
  (_, index) => `<div class="scan-line"><span>${String(index + 1).padStart(2, "0")}</span><i></i></div>`,
).join("");

runButton.addEventListener("click", async () => {
  setLoading(true);
  try {
    const response = await fetch(`./data/latest.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("The latest screen is not available yet.");
    const screen = await response.json();
    if (!Array.isArray(screen.results) || screen.results.length !== 10) {
      throw new Error("The latest screen did not contain ten qualifying stocks.");
    }
    renderScreen(screen);
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    errorMessage.textContent = error instanceof Error ? error.message : "Please try again.";
    errorMessage.hidden = false;
    readyState.hidden = false;
  } finally {
    setLoading(false);
  }
});

exportButton.addEventListener("click", () => {
  if (!lastScreen || !globalThis.NearTermPdf) return;
  exportButton.disabled = true;
  try {
    const filename = globalThis.NearTermPdf.downloadPdf(lastScreen, new Date());
    exportStatus.textContent = `Saved ${filename}`;
  } catch (error) {
    exportStatus.textContent = error instanceof Error ? error.message : "The PDF could not be saved.";
  } finally {
    exportButton.disabled = false;
  }
});

function setLoading(isLoading) {
  runButton.disabled = isLoading;
  runButton.querySelector("span").textContent = isLoading ? "Loading the latest screen" : "Run a fresh screen";
  errorMessage.hidden = true;
  loadingState.hidden = !isLoading;
  if (isLoading) {
    exportStatus.textContent = "";
    readyState.hidden = true;
    resultsSection.hidden = true;
  }
}

function renderScreen(screen) {
  lastScreen = screen;
  document.querySelector("#data-date").textContent = screen.dataDate;
  document.querySelector("#horizon").textContent = screen.horizon;
  document.querySelector("#universe").textContent = screen.universe;
  document.querySelector("#methodology").textContent = screen.methodology;
  document.querySelector("#limitations").textContent = screen.limitations;
  resultsList.innerHTML = screen.results.map(stockTemplate).join("");
  readyState.hidden = true;
  resultsSection.hidden = false;
  exportButton.disabled = false;
}

function stockTemplate(stock) {
  const sign = stock.impliedReturn >= 0 ? "+" : "";
  const returnClass = stock.impliedReturn >= 0 ? "positive" : "negative";
  return `
    <details class="stock-row">
      <summary>
        <span class="identity">
          <span class="rank">${String(stock.rank).padStart(2, "0")}</span>
          <strong>${escapeHtml(stock.ticker)}</strong>
          <span>${escapeHtml(stock.company)}</span>
          <small>${escapeHtml(stock.exchange)} · ${escapeHtml(stock.sector)}</small>
        </span>
        <span class="price-cell">${money.format(stock.currentPrice)}</span>
        <span class="range-cell">${money.format(stock.targetRange[0])}–${money.format(stock.targetRange[1])}</span>
        <span class="weighted-cell">
          <strong>${money.format(stock.weightedTarget)}</strong>
          <small class="${returnClass}">${sign}${stock.impliedReturn}%</small>
        </span>
        <span class="setup-cell">
          <strong>${escapeHtml(stock.setup)}</strong>
          <small>${escapeHtml(stock.confidence)} confidence · ${escapeHtml(stock.risk)} risk</small>
        </span>
        <span class="expand-control" aria-hidden="true">+</span>
      </summary>
      <div class="stock-detail">
        <div class="detail-thesis">
          <p class="detail-label">What appears priced in</p>
          <p>${escapeHtml(stock.pricedIn)}</p>
          <ul>${stock.drivers.map((driver) => `<li>${escapeHtml(driver)}</li>`).join("")}</ul>
          <p><strong>Invalidation:</strong> ${escapeHtml(stock.invalidation)}</p>
        </div>
        <div>
          <p class="detail-label">Scenario targets</p>
          ${stock.scenarios.map((scenario) => `
            <div class="scenario">
              <span>${escapeHtml(scenario.name)} / ${scenario.probability}%</span>
              <strong>${money.format(scenario.target)}</strong>
              <p>${escapeHtml(scenario.logic)}</p>
            </div>`).join("")}
        </div>
        <div class="metrics-block">
          <p class="detail-label">Signal snapshot</p>
          <dl>
            ${metric("5-day momentum", signed(stock.metrics.fiveDayMomentum) + "%")}
            ${metric("20-day momentum", signed(stock.metrics.twentyDayMomentum) + "%")}
            ${metric("60-day momentum", signed(stock.metrics.sixtyDayMomentum) + "%")}
            ${metric("RSI (14)", stock.metrics.rsi14)}
            ${metric("Avg. volume", compact.format(stock.metrics.averageVolume))}
            ${metric("Volume trend", signed(stock.metrics.volumeTrend) + "%")}
          </dl>
          <a href="${stock.sourceUrl}" target="_blank" rel="noreferrer">Verify market data ↗</a>
        </div>
      </div>
    </details>`;
}

function metric(label, value) {
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}
