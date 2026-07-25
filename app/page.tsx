"use client";

import { useState } from "react";

type Scenario = {
  name: string;
  probability: number;
  target: number;
  logic: string;
};

type StockResult = {
  rank: number;
  company: string;
  ticker: string;
  exchange: string;
  currency: string;
  sector: string;
  currentPrice: number;
  dataDate: string;
  entryReferenceZone: [number, number];
  targetRange: [number, number];
  weightedTarget: number;
  impliedReturn: number;
  setup: string;
  risk: string;
  confidence: string;
  score: number;
  metrics: {
    fiveDayMomentum: number;
    twentyDayMomentum: number;
    sixtyDayMomentum: number;
    rsi14: number;
    averageVolume: number;
    volumeTrend: number;
  };
  scenarios: Scenario[];
  drivers: string[];
  pricedIn: string;
  invalidation: string;
  sourceUrl: string;
};

type ScreenResponse = {
  generatedAt: string;
  dataDate: string;
  horizon: string;
  universe: string;
  methodology: string;
  limitations: string;
  results: StockResult[];
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function Home() {
  const [screen, setScreen] = useState<ScreenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function runScreen() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/screen", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as ScreenResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "The screen could not be completed.");
      }
      setScreen(payload);
      requestAnimationFrame(() => {
        document.querySelector("#ranked-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The screen could not be completed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Near Term Signal home">
          <span className="brand-mark" aria-hidden="true">N/</span>
          <span>Near Term Signal</span>
        </a>
        <div className="market-state">
          <span className="market-dot" aria-hidden="true" />
          U.S. equity screen
        </div>
      </header>

      <section className="workspace" id="top">
        <div className="intro">
          <p className="eyebrow">Quantitative research / 1–5 trading days</p>
          <h1>
            Ten liquid stocks.
            <br />
            One near-term screen.
          </h1>
          <p className="lede">
            Rank U.S.-listed names under $120 using current price action,
            sector strength, volume, downside risk, and scenario-weighted targets.
          </p>
        </div>

        <div className="run-panel" aria-label="Screen settings">
          <div className="scope-list">
            <div>
              <span>Universe</span>
              <strong>Liquid U.S. listings</strong>
            </div>
            <div>
              <span>Price ceiling</span>
              <strong>Under $120</strong>
            </div>
            <div>
              <span>Risk profile</span>
              <strong>Balanced</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>10 ranked stocks</strong>
            </div>
          </div>
          <button
            className="run-button"
            type="button"
            onClick={runScreen}
            disabled={isLoading}
          >
            <span>{isLoading ? "Scanning market data" : screen ? "Run a fresh screen" : "Generate the list"}</span>
            <span className="button-arrow" aria-hidden="true">{isLoading ? "•••" : "↗"}</span>
          </button>
          <p className="run-note">
            Delayed or previous-close data. Research output, not personal financial advice.
          </p>
          {error ? <p className="error-message" role="alert">{error}</p> : null}
        </div>
      </section>

      <section className="signal-band" aria-label="Method summary">
        <span>01 / Expectation changes</span>
        <span>02 / Relative momentum</span>
        <span>03 / Bear · Base · Bull</span>
        <span>04 / Downside first</span>
      </section>

      {isLoading ? <LoadingState /> : null}
      {screen ? <Results screen={screen} /> : !isLoading ? <ReadyState /> : null}

      <footer>
        <div>
          <span className="brand footer-brand"><span className="brand-mark">N/</span> Near Term Signal</span>
          <p>Structured, uncertain research for faster first-pass screening.</p>
        </div>
        <p className="footer-disclosure">
          Forecasts are scenarios, not certainties. Verify prices, catalysts,
          fundamentals, and suitability independently.
        </p>
      </footer>
    </main>
  );
}

function LoadingState() {
  return (
    <section className="loading-section" aria-live="polite" aria-busy="true">
      <div className="loading-copy">
        <p className="eyebrow">Screen in progress</p>
        <h2>Reading price, volume, and sector signals.</h2>
        <p>The ranking will appear here when ten qualifying names are scored.</p>
      </div>
      <div className="scan-lines" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <div className="scan-line" key={index}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReadyState() {
  return (
    <section className="ready-section">
      <div>
        <p className="eyebrow">Ready to screen</p>
        <h2>The ranked field will land here.</h2>
      </div>
      <div className="ready-index" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index}>{String(index + 1).padStart(2, "0")}</span>
        ))}
      </div>
    </section>
  );
}

function Results({ screen }: { screen: ScreenResponse }) {
  return (
    <section className="results-section" id="ranked-results">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Latest ranked screen</p>
          <h2>Near-term signal list</h2>
        </div>
        <dl className="results-meta">
          <div>
            <dt>Data date</dt>
            <dd>{screen.dataDate}</dd>
          </div>
          <div>
            <dt>Horizon</dt>
            <dd>{screen.horizon}</dd>
          </div>
        </dl>
      </div>

      <div className="table-header" aria-hidden="true">
        <span>Rank / stock</span>
        <span>Current</span>
        <span>Bear–bull range</span>
        <span>Weighted</span>
        <span>Setup / confidence</span>
        <span />
      </div>

      <div className="results-list">
        {screen.results.map((stock, index) => (
          <details
            className="stock-row"
            key={stock.ticker}
            style={{ "--row-delay": `${index * 45}ms` } as React.CSSProperties}
          >
            <summary>
              <span className="rank">{String(stock.rank).padStart(2, "0")}</span>
              <span className="identity">
                <strong>{stock.ticker}</strong>
                <span>{stock.company}</span>
                <small>{stock.exchange} · {stock.sector}</small>
              </span>
              <span className="price-cell" data-label="Current">{money.format(stock.currentPrice)}</span>
              <span className="range-cell" data-label="Bear–bull">
                {money.format(stock.targetRange[0])}–{money.format(stock.targetRange[1])}
              </span>
              <span className="weighted-cell" data-label="Weighted">
                <strong>{money.format(stock.weightedTarget)}</strong>
                <small className={stock.impliedReturn >= 0 ? "positive" : "negative"}>
                  {stock.impliedReturn >= 0 ? "+" : ""}{stock.impliedReturn}%
                </small>
              </span>
              <span className="setup-cell">
                <strong>{stock.setup}</strong>
                <small>{stock.confidence} confidence · {stock.risk} risk</small>
              </span>
              <span className="expand-control" aria-hidden="true">+</span>
            </summary>
            <StockDetail stock={stock} />
          </details>
        ))}
      </div>

      <div className="method-note">
        <div>
          <p className="eyebrow">Screen construction</p>
          <p>{screen.universe}</p>
          <p>{screen.methodology}</p>
        </div>
        <div>
          <p className="eyebrow">Data limitations</p>
          <p>{screen.limitations}</p>
        </div>
      </div>
    </section>
  );
}

function StockDetail({ stock }: { stock: StockResult }) {
  return (
    <div className="stock-detail">
      <div className="detail-thesis">
        <p className="detail-label">What appears priced in</p>
        <p>{stock.pricedIn}</p>
        <ul>
          {stock.drivers.map((driver) => <li key={driver}>{driver}</li>)}
        </ul>
        <p className="invalidation">
          <strong>Invalidation:</strong> {stock.invalidation}
        </p>
      </div>

      <div className="scenario-block">
        <p className="detail-label">Scenario targets</p>
        {stock.scenarios.map((scenario) => (
          <div className="scenario" key={scenario.name}>
            <span>{scenario.name} / {scenario.probability}%</span>
            <strong>{money.format(scenario.target)}</strong>
            <p>{scenario.logic}</p>
          </div>
        ))}
      </div>

      <div className="metrics-block">
        <p className="detail-label">Signal snapshot</p>
        <dl>
          <div><dt>5-day momentum</dt><dd>{signed(stock.metrics.fiveDayMomentum)}%</dd></div>
          <div><dt>20-day momentum</dt><dd>{signed(stock.metrics.twentyDayMomentum)}%</dd></div>
          <div><dt>60-day momentum</dt><dd>{signed(stock.metrics.sixtyDayMomentum)}%</dd></div>
          <div><dt>RSI (14)</dt><dd>{stock.metrics.rsi14}</dd></div>
          <div><dt>Avg. volume</dt><dd>{compactNumber.format(stock.metrics.averageVolume)}</dd></div>
          <div><dt>Volume trend</dt><dd>{signed(stock.metrics.volumeTrend)}%</dd></div>
        </dl>
        <a href={stock.sourceUrl} target="_blank" rel="noreferrer">
          Verify market data ↗
        </a>
      </div>
    </div>
  );
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}
