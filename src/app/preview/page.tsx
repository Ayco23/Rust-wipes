import Link from "next/link";

const units = [
  "recurrence",
  "battlemetrics",
  "ingest",
  "wipes-api",
  "admin",
  "calendar",
  "day",
  "filters",
  "picker",
  "legend",
];

export default function PreviewIndex() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Preview routes</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Each parallel worker contributes a self-contained slice at one of these paths.
      </p>
      <ul className="mt-6 space-y-2">
        {units.map((u) => (
          <li key={u}>
            <Link className="text-rust-600 underline" href={`/preview/${u}`}>
              /preview/{u}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
