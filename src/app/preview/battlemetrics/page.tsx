"use client";

import { useState, type ReactElement } from "react";

type ServerResult = {
  id: string;
  name: string;
  lastWipeAt: string | null;
};

export default function BattleMetricsPreviewPage(): ReactElement {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/_preview/battlemetrics?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { results: ServerResult[] };
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">BattleMetrics preview</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Rust servers by name"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading || query.trim().length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="space-y-2">
        {results.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-600">
              ID: {s.id} | Last wipe: {s.lastWipeAt ?? "unknown"}
            </div>
          </li>
        ))}
        {!loading && results.length === 0 && !error && (
          <li className="text-gray-500">No results yet. Try a search.</li>
        )}
      </ul>
    </main>
  );
}
