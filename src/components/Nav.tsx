import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

const links: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/preview", label: "Preview" },
];

export function Nav() {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur",
        "dark:border-neutral-800 dark:bg-neutral-950/80",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-rust-600">
          Rust Wipes
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-neutral-700 hover:text-rust-600 dark:text-neutral-300 dark:hover:text-rust-400"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Nav;
