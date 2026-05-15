export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold text-rust-600">Rust Wipes</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Calendar of upcoming Rust server wipes. Scaffold ready — features land via parallel PRs.
      </p>
      <p className="mt-4 text-sm">
        Preview routes for individual feature slices live under{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">/preview/&lt;unit&gt;</code>.
      </p>
    </main>
  );
}
