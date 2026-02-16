import { useCallback, useEffect, useState } from "react";

/**
 * DummyJSON Quotes API.
 * Docs: https://dummyjson.com/docs/quotes
 */
const BASE_URL = "https://dummyjson.com";

/**
 * Učita N random quote-ova. Vraća { quotes, loading, error, reload }.
 * quotes format: [{ id, quote, author }, ...]
 */
export default function useRandomQuotes(count = 3) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const requests = Array.from({ length: count }).map(() =>
        fetch(`${BASE_URL}/quotes/random`, { signal }).then(async (r) => {
          const data = await r.json();
          if (!r.ok) {
            const msg =
              data?.message ||
              data?.error ||
              "Ne mogu da učitam random quote sa DummyJSON.";
            throw new Error(msg);
          }
          return data;
        })
      );

      const results = await Promise.all(requests);

      // Očisti duplikate (nekad random može vratiti isti quote).
      const uniq = [];
      const seen = new Set();
      for (const q of results) {
        const key = q?.id ?? q?.quote;
        if (!seen.has(key)) {
          seen.add(key);
          uniq.push(q);
        }
      }

      setQuotes(uniq);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Greška pri učitavanju quote-ova.");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [count]);

  const reload = useCallback(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { quotes, loading, error, reload };
}
