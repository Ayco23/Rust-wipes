import { cn } from "@/lib/cn";

export function Footer() {
  return (
    <footer
      className={cn(
        "border-t border-neutral-200 bg-neutral-50 py-4 text-sm text-neutral-500",
        "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <span>Rust Wipes &mdash; community calendar</span>
        <a
          href="https://github.com/ayco23/rust-wipes"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-rust-600 dark:hover:text-rust-400"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
