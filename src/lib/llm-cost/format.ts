export const fmt = {
    usd: (v: number) => `$${Math.round(v).toLocaleString()}`,
    usdCents: (v: number) => `$${v.toFixed(2)}`,
    pct: (v: number) => `${v.toFixed(1)}%`,
    num: (v: number) => Math.round(v).toLocaleString(),
    ftes: (v: number) => v.toFixed(2),
    months: (v: number) => (v === Infinity || v < 0 ? 'N/A' : `${v} mo`),
  } as const;
  
  export type Formatters = typeof fmt;
  