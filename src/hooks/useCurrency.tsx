import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from USD
  costMultiplier: number; // Cost-of-living adjustment
   countryCode?: string; // For geolocation matching
}

// Regional price multipliers based on cost of living
// USD = 1.0 baseline, others adjusted for local grocery costs
export const CURRENCIES: Currency[] = [
   { code: "USD", symbol: "$", name: "US Dollar", rate: 1, costMultiplier: 1.0, countryCode: "US" },
   { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.12, costMultiplier: 0.30, countryCode: "IN" },
   { code: "EUR", symbol: "€", name: "Euro", rate: 0.92, costMultiplier: 1.15, countryCode: "EU" },
   { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79, costMultiplier: 1.25, countryCode: "GB" },
   { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36, costMultiplier: 1.10, countryCode: "CA" },
   { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53, costMultiplier: 1.20, countryCode: "AU" },
   { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 148.5, costMultiplier: 1.30, countryCode: "JP" },
];

 // Map country codes to currencies (including EU countries)
 const COUNTRY_TO_CURRENCY: Record<string, string> = {
   US: "USD",
   IN: "INR",
   GB: "GBP",
   CA: "CAD",
   AU: "AUD",
   JP: "JPY",
   // EU countries
   DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
   BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR",
   GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR",
   LT: "EUR", CY: "EUR", MT: "EUR", LU: "EUR",
 };

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (usdPrice: number) => string;
  convertPrice: (usdPrice: number) => number;
   detectedLocation: string | null;
}

const RATES_CACHE_KEY = "ledger_fx_rates";
const RATES_TTL_MS = 24 * 60 * 60 * 1000;

interface RatesCache { rates: Record<string, number>; fetchedAt: number; }

async function fetchLiveRates(): Promise<Record<string, number> | null> {
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const parsed: RatesCache = JSON.parse(cached);
      if (Date.now() - parsed.fetchedAt < RATES_TTL_MS) return parsed.rates;
    }
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR,EUR,GBP,CAD,AUD,JPY");
    if (!res.ok) return null;
    const data = await res.json() as { rates: Record<string, number> };
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: data.rates, fetchedAt: Date.now() }));
    return data.rates;
  } catch {
    return null;
  }
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);
   const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("preferred-currency");
    if (saved) {
      const found = CURRENCIES.find(c => c.code === saved);
      if (found) setCurrencyState(found);
       return; // Don't auto-detect if user has a preference
    }

     // Use browser locale instead of third-party IP-based geolocation.
     const locale = navigator.language || "";
     const countryCode = locale.split("-")[1]?.toUpperCase();
     if (!countryCode) return;

     setDetectedLocation(countryCode);

     const currencyCode = COUNTRY_TO_CURRENCY[countryCode];
     if (!currencyCode) return;

     const found = CURRENCIES.find(c => c.code === currencyCode);
     if (found) {
       setCurrencyState(found);
       // Don't save to localStorage so user can override.
     }
  }, []);

  useEffect(() => {
    fetchLiveRates().then((liveRates) => {
      if (!liveRates) return;
      CURRENCIES.forEach((c) => {
        if (liveRates[c.code] !== undefined) {
          c.rate = liveRates[c.code];
        }
      });
      setCurrencyState((prev) => {
        const updated = CURRENCIES.find((c) => c.code === prev.code);
        return updated ? { ...updated } : prev;
      });
    });
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("preferred-currency", newCurrency.code);
  };

  const convertPrice = (usdPrice: number): number => {
    // Apply cost-of-living adjustment then convert to local currency
    const adjustedPrice = usdPrice * currency.costMultiplier;
    return adjustedPrice * currency.rate;
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice);
    
    // Format based on currency
    if (currency.code === "JPY") {
      return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    }
    
    // For INR, show without decimals for larger amounts
    if (currency.code === "INR" && converted >= 10) {
      return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    }
    
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
     <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, detectedLocation }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
