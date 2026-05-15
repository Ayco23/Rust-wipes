import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  colorForHost,
  colorForRestriction,
  colorForType,
} from "@/lib/serverColors";
import type { Host, PlayerRestriction, ServerType } from "@/types/wipes";

const TYPES: readonly ServerType[] = ["official", "community", "modded"];

const RESTRICTIONS: readonly PlayerRestriction[] = [
  "none",
  "solo",
  "duo",
  "trio",
  "quad",
  "quintet",
  "other",
];

interface LegendProps {
  hosts?: readonly Host[];
}

function Swatch({ className }: { className: string }): ReactElement {
  return (
    <span
      className={cn("inline-block h-3 w-3 shrink-0 rounded-sm", className)}
      aria-hidden
    />
  );
}

function Row({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      <ul className="mt-2 flex flex-wrap gap-3">{children}</ul>
    </section>
  );
}

export function Legend({ hosts }: LegendProps): ReactElement {
  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
      <Row title="Server type">
        {TYPES.map((t) => (
          <li key={t} className="flex items-center gap-2 text-sm">
            <Swatch className={colorForType(t)} />
            <span className="capitalize">{t}</span>
          </li>
        ))}
      </Row>
      <Row title="Player restriction">
        {RESTRICTIONS.map((r) => (
          <li key={r} className="flex items-center gap-2 text-sm">
            <Swatch className={colorForRestriction(r)} />
            <span className="capitalize">{r}</span>
          </li>
        ))}
      </Row>
      {hosts && hosts.length > 0 && (
        <Row title="Hosts">
          {hosts.map((h) => {
            const c = colorForHost(h.id);
            return (
              <li
                key={h.id}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1 text-sm ring-1",
                  c.bg,
                  c.text,
                  c.ring,
                )}
              >
                <span>{h.name}</span>
              </li>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default Legend;
