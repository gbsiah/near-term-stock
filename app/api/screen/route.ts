type UniverseStock = {
  ticker: string;
  company: string;
  exchange: "NYSE" | "NASDAQ";
  sector: string;
};

type PricePoint = {
  close: number;
  volume: number;
  timestamp: number;
};

type Candidate = UniverseStock & {
  price: number;
  dataDate: string;
  averageVolume: number;
  dailyVolatility: number;
  return5d: number;
  return20d: number;
  return60d: number;
  rsi14: number;
  distanceFromMa20: number;
  volumeRatio: number;
  rangePosition: number;
};

const UNIVERSE: UniverseStock[] = [
  { ticker: "AAL", company: "American Airlines", exchange: "NASDAQ", sector: "Industrials" },
  { ticker: "ADM", company: "Archer-Daniels-Midland", exchange: "NYSE", sector: "Consumer Staples" },
  { ticker: "AES", company: "AES", exchange: "NYSE", sector: "Utilities" },
  { ticker: "BAC", company: "Bank of America", exchange: "NYSE", sector: "Financials" },
  { ticker: "BAX", company: "Baxter International", exchange: "NYSE", sector: "Health Care" },
  { ticker: "BMY", company: "Bristol-Myers Squibb", exchange: "NYSE", sector: "Health Care" },
  { ticker: "C", company: "Citigroup", exchange: "NYSE", sector: "Financials" },
  { ticker: "CCL", company: "Carnival", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "CMCSA", company: "Comcast", exchange: "NASDAQ", sector: "Communication Services" },
  { ticker: "COP", company: "ConocoPhillips", exchange: "NYSE", sector: "Energy" },
  { ticker: "CSCO", company: "Cisco Systems", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "CVS", company: "CVS Health", exchange: "NYSE", sector: "Health Care" },
  { ticker: "DAL", company: "Delta Air Lines", exchange: "NYSE", sector: "Industrials" },
  { ticker: "DBX", company: "Dropbox", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "DD", company: "DuPont", exchange: "NYSE", sector: "Materials" },
  { ticker: "DOCU", company: "DocuSign", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "DVN", company: "Devon Energy", exchange: "NYSE", sector: "Energy" },
  { ticker: "EBAY", company: "eBay", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { ticker: "ENPH", company: "Enphase Energy", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "EXC", company: "Exelon", exchange: "NASDAQ", sector: "Utilities" },
  { ticker: "F", company: "Ford Motor", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "FCX", company: "Freeport-McMoRan", exchange: "NYSE", sector: "Materials" },
  { ticker: "GILD", company: "Gilead Sciences", exchange: "NASDAQ", sector: "Health Care" },
  { ticker: "GM", company: "General Motors", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "HAL", company: "Halliburton", exchange: "NYSE", sector: "Energy" },
  { ticker: "HPE", company: "Hewlett Packard Enterprise", exchange: "NYSE", sector: "Technology" },
  { ticker: "HPQ", company: "HP", exchange: "NYSE", sector: "Technology" },
  { ticker: "INTC", company: "Intel", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "KHC", company: "Kraft Heinz", exchange: "NASDAQ", sector: "Consumer Staples" },
  { ticker: "KO", company: "Coca-Cola", exchange: "NYSE", sector: "Consumer Staples" },
  { ticker: "KR", company: "Kroger", exchange: "NYSE", sector: "Consumer Staples" },
  { ticker: "LUV", company: "Southwest Airlines", exchange: "NYSE", sector: "Industrials" },
  { ticker: "LYFT", company: "Lyft", exchange: "NASDAQ", sector: "Industrials" },
  { ticker: "MOS", company: "Mosaic", exchange: "NYSE", sector: "Materials" },
  { ticker: "NCLH", company: "Norwegian Cruise Line", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "NEM", company: "Newmont", exchange: "NYSE", sector: "Materials" },
  { ticker: "NIO", company: "NIO", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "NU", company: "Nu Holdings", exchange: "NYSE", sector: "Financials" },
  { ticker: "ON", company: "ON Semiconductor", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "OXY", company: "Occidental Petroleum", exchange: "NYSE", sector: "Energy" },
  { ticker: "PCG", company: "PG&E", exchange: "NYSE", sector: "Utilities" },
  { ticker: "PFE", company: "Pfizer", exchange: "NYSE", sector: "Health Care" },
  { ticker: "PINS", company: "Pinterest", exchange: "NYSE", sector: "Communication Services" },
  { ticker: "PLTR", company: "Palantir", exchange: "NASDAQ", sector: "Technology" },
  { ticker: "PYPL", company: "PayPal", exchange: "NASDAQ", sector: "Financials" },
  { ticker: "RIVN", company: "Rivian Automotive", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { ticker: "RF", company: "Regions Financial", exchange: "NYSE", sector: "Financials" },
  { ticker: "SCHW", company: "Charles Schwab", exchange: "NYSE", sector: "Financials" },
  { ticker: "SLB", company: "SLB", exchange: "NYSE", sector: "Energy" },
  { ticker: "SNAP", company: "Snap", exchange: "NYSE", sector: "Communication Services" },
  { ticker: "SOFI", company: "SoFi Technologies", exchange: "NASDAQ", sector: "Financials" },
  { ticker: "T", company: "AT&T", exchange: "NYSE", sector: "Communication Services" },
  { ticker: "TGT", company: "Target", exchange: "NYSE", sector: "Consumer Discretionary" },
  { ticker: "UBER", company: "Uber Technologies", exchange: "NYSE", sector: "Industrials" },
  { ticker: "USB", company: "U.S. Bancorp", exchange: "NYSE", sector: "Financials" },
  { ticker: "VZ", company: "Verizon", exchange: "NYSE", sector: "Communication Services" },
  { ticker: "WBA", company: "Walgreens Boots Alliance", exchange: "NASDAQ", sector: "Consumer Staples" },
  { ticker: "WBD", company: "Warner Bros. Discovery", exchange: "NASDAQ", sector: "Communication Services" },
  { ticker: "WFC", company: "Wells Fargo", exchange: "NYSE", sector: "Financials" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
};

function standardDeviation(values: number[]) {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function calculateRsi(closes: number[], period = 14) {
  const recent = closes.slice(-period - 1);
  const changes = recent.slice(1).map((close, index) => close - recent[index]);
  const gains = mean(changes.map((change) => Math.max(change, 0)));
  const losses = mean(changes.map((change) => Math.max(-change, 0)));
  if (losses === 0) return gains > 0 ? 100 : 50;
  const relativeStrength = gains / losses;
  return 100 - 100 / (1 + relativeStrength);
}

async function fetchCandidate(stock: UniverseStock): Promise<Candidate | null> {
  const endpoint = new URL(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.ticker)}`,
  );
  endpoint.searchParams.set("interval", "1d");
  endpoint.searchParams.set("range", "6mo");
  endpoint.searchParams.set("events", "div,splits");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NearTermSignal/1.0",
    },
    cache: "no-store",
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: {
          quote?: Array<{
            close?: Array<number | null>;
            volume?: Array<number | null>;
          }>;
        };
      }>;
    };
  };

  const result = payload.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0];
  const points: PricePoint[] = (quote?.close ?? [])
    .map((close, index) => ({
      close: close ?? 0,
      volume: quote?.volume?.[index] ?? 0,
      timestamp: timestamps[index] ?? 0,
    }))
    .filter((point) => point.close > 0 && point.timestamp > 0);

  if (points.length < 65) return null;
  const closes = points.map((point) => point.close);
  const volumes = points.map((point) => point.volume);
  const price = closes.at(-1) ?? 0;
  const returns = closes.slice(-22).slice(1).map((close, index) => {
    const previous = closes.at(-22 + index) ?? close;
    return previous > 0 ? close / previous - 1 : 0;
  });
  const recentHigh = Math.max(...closes.slice(-126));
  const recentLow = Math.min(...closes.slice(-126));
  const averageVolume = mean(volumes.slice(-20));
  const priorVolume = mean(volumes.slice(-40, -20));
  const lastPoint = points.at(-1)!;

  return {
    ...stock,
    price,
    dataDate: new Date(lastPoint.timestamp * 1000).toISOString().slice(0, 10),
    averageVolume,
    dailyVolatility: standardDeviation(returns),
    return5d: price / (closes.at(-6) ?? price) - 1,
    return20d: price / (closes.at(-21) ?? price) - 1,
    return60d: price / (closes.at(-61) ?? price) - 1,
    rsi14: calculateRsi(closes),
    distanceFromMa20: price / mean(closes.slice(-20)) - 1,
    volumeRatio: priorVolume > 0 ? averageVolume / priorVolume : 1,
    rangePosition:
      recentHigh > recentLow ? (price - recentLow) / (recentHigh - recentLow) : 0.5,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const output = new Array<R>(items.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        output[index] = await mapper(items[index]);
      }
    }),
  );
  return output;
}

function setupLabel(score: number) {
  if (score >= 1) return "Strong bullish setup";
  if (score >= 0.3) return "Moderately positive";
  if (score > -0.3) return "Neutral / unclear";
  if (score > -1) return "Moderately negative";
  return "Bearish setup";
}

export async function POST() {
  try {
    const fetched = await mapWithConcurrency(UNIVERSE, 8, async (stock) => {
      try {
        return await fetchCandidate(stock);
      } catch {
        return null;
      }
    });

    const candidates = fetched.filter(
      (candidate): candidate is Candidate =>
        candidate !== null &&
        candidate.price <= 120 &&
        candidate.price >= 2 &&
        candidate.averageVolume >= 500_000,
    );

    if (candidates.length < 10) {
      return Response.json(
        {
          error:
            "Current market data did not return enough qualifying stocks. Please run the screen again shortly.",
        },
        { status: 503 },
      );
    }

    const sectorReturns = new Map<string, number>();
    for (const sector of new Set(candidates.map((candidate) => candidate.sector))) {
      sectorReturns.set(
        sector,
        median(
          candidates
            .filter((candidate) => candidate.sector === sector)
            .map((candidate) => candidate.return20d),
        ),
      );
    }

    const horizon = 3;
    const scored = candidates.map((candidate) => {
      const momentum = clamp(
        Math.tanh(candidate.return5d * 15 + candidate.return20d * 7) * 2,
        -2,
        2,
      );
      const sectorSupport = clamp(
        Math.tanh(
          ((sectorReturns.get(candidate.sector) ?? 0) + candidate.return20d * 0.35) * 9,
        ) * 2,
        -2,
        2,
      );
      const technical = clamp(
        Math.tanh(candidate.distanceFromMa20 * 18) * 1.5 -
          Math.max(0, candidate.rsi14 - 74) / 20,
        -2,
        2,
      );
      const positioning = clamp(Math.tanh((candidate.volumeRatio - 1) * 2.5) * 2, -2, 2);
      const expectationRoom = clamp((0.62 - candidate.rangePosition) * 2.2, -1.25, 1.25);
      const downsideRisk = clamp(
        1.4 - candidate.dailyVolatility * 55 - Math.max(0, -candidate.return20d) * 5,
        -2,
        2,
      );
      const liquidity = clamp(Math.log10(candidate.averageVolume / 500_000), 0, 2);
      const score =
        momentum * 0.3 +
        sectorSupport * 0.2 +
        technical * 0.15 +
        positioning * 0.1 +
        expectationRoom * 0.1 +
        downsideRisk * 0.1 +
        liquidity * 0.05;

      const horizonVolatility = clamp(
        candidate.dailyVolatility * Math.sqrt(horizon),
        0.018,
        0.12,
      );
      const expectedMove = clamp(
        score * horizonVolatility * 0.32,
        -horizonVolatility * 0.55,
        horizonVolatility * 0.55,
      );
      const bear = candidate.price * (1 - horizonVolatility * (1.05 + Math.max(0, -score) * 0.12));
      const base = candidate.price * (1 + expectedMove);
      const bull = candidate.price * (1 + horizonVolatility * (1.05 + Math.max(0, score) * 0.12));
      const weightedTarget = bear * 0.25 + base * 0.5 + bull * 0.25;
      const downside = bear / candidate.price - 1;
      const riskAdjustedReturn =
        weightedTarget / candidate.price - 1 + downside * 0.2 + liquidity * 0.002;

      return {
        ...candidate,
        score,
        momentum,
        sectorSupport,
        technical,
        positioning,
        expectationRoom,
        downsideRisk,
        liquidity,
        bear,
        base,
        bull,
        weightedTarget,
        riskAdjustedReturn,
      };
    });

    const results = scored
      .sort((a, b) => b.riskAdjustedReturn - a.riskAdjustedReturn)
      .slice(0, 10)
      .map((candidate, index) => {
        const risk =
          candidate.dailyVolatility >= 0.04
            ? "High"
            : candidate.dailyVolatility >= 0.025
              ? "Elevated"
              : "Balanced";
        const confidence =
          candidate.averageVolume >= 2_000_000 && candidate.dailyVolatility < 0.05
            ? "Medium"
            : "Low";
        const pricedIn =
          candidate.rangePosition > 0.75
            ? "Positive momentum is already partly reflected near the upper end of its six-month range."
            : candidate.rangePosition < 0.35
              ? "Expectations appear subdued versus the six-month range, leaving rebound room if momentum persists."
              : "Price sits mid-range, suggesting neither an obvious momentum premium nor a deep expectation discount.";

        return {
          rank: index + 1,
          company: candidate.company,
          ticker: candidate.ticker,
          exchange: candidate.exchange,
          currency: "USD",
          sector: candidate.sector,
          currentPrice: round(candidate.price),
          dataDate: candidate.dataDate,
          entryReferenceZone: [
            round(candidate.price * (1 - candidate.dailyVolatility * 0.25)),
            round(candidate.price * (1 + candidate.dailyVolatility * 0.25)),
          ],
          targetRange: [round(candidate.bear), round(candidate.bull)],
          weightedTarget: round(candidate.weightedTarget),
          impliedReturn: round((candidate.weightedTarget / candidate.price - 1) * 100, 1),
          setup: setupLabel(candidate.score),
          risk,
          confidence,
          score: round(candidate.score, 2),
          metrics: {
            fiveDayMomentum: round(candidate.return5d * 100, 1),
            twentyDayMomentum: round(candidate.return20d * 100, 1),
            sixtyDayMomentum: round(candidate.return60d * 100, 1),
            rsi14: round(candidate.rsi14, 0),
            averageVolume: Math.round(candidate.averageVolume),
            volumeTrend: round((candidate.volumeRatio - 1) * 100, 0),
          },
          scenarios: [
            {
              name: "Bear",
              probability: 25,
              target: round(candidate.bear),
              logic: "Momentum fails and the stock moves roughly one horizon-adjusted volatility band lower.",
            },
            {
              name: "Base",
              probability: 50,
              target: round(candidate.base),
              logic: "Recent momentum and sector direction persist without a material expectation shock.",
            },
            {
              name: "Bull",
              probability: 25,
              target: round(candidate.bull),
              logic: "Relative strength holds and price extends about one volatility band higher.",
            },
          ],
          drivers: [
            `${candidate.return20d >= 0 ? "Positive" : "Negative"} 20-day price momentum of ${round(candidate.return20d * 100, 1)}%.`,
            `${candidate.volumeRatio >= 1 ? "Rising" : "Cooling"} 20-day volume versus the prior month (${round((candidate.volumeRatio - 1) * 100, 0)}%).`,
            `${candidate.sector} peer momentum is ${((sectorReturns.get(candidate.sector) ?? 0) >= 0) ? "supportive" : "a headwind"}.`,
          ],
          pricedIn,
          invalidation:
            candidate.price >= candidate.base
              ? `A close below $${round(candidate.price * (1 - candidate.dailyVolatility * 1.1))} on heavier volume would weaken the setup.`
              : `Failure to hold the $${round(candidate.bear)} bear-case level would invalidate the near-term range.`,
          sourceUrl: `https://finance.yahoo.com/quote/${candidate.ticker}`,
        };
      });

    const latestDataDate = results
      .map((result) => result.dataDate)
      .sort()
      .at(-1);

    return Response.json(
      {
        generatedAt: new Date().toISOString(),
        dataDate: latestDataDate,
        horizon: "1–5 trading days",
        universe:
          `${UNIVERSE.length} pre-screened liquid U.S. listings; $2–$120 price; ` +
          "20-day average volume of at least 500,000 shares",
        methodology:
          "Availability-adjusted skill screen: price momentum 30%, sector support 20%, technical trend 15%, volume/positioning 10%, expectation room 10%, downside risk 10%, liquidity 5%.",
        limitations:
          "This automated first pass uses delayed or previous-close price and volume data. It does not include live analyst revisions, fundamental valuation, options positioning, or a verified event calendar; those require a full cited research pass.",
        results,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "The market-data screen is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
