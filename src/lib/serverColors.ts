import type { PlayerRestriction, ServerType } from "@/types/wipes";

export interface HostColor {
  bg: string;
  text: string;
  ring: string;
}

// Static Tailwind class strings so the content scanner keeps them.
const HOST_PALETTES: readonly HostColor[] = [
  { bg: "bg-amber-500", text: "text-amber-50", ring: "ring-amber-300" },
  { bg: "bg-rose-500", text: "text-rose-50", ring: "ring-rose-300" },
  { bg: "bg-sky-500", text: "text-sky-50", ring: "ring-sky-300" },
  { bg: "bg-emerald-500", text: "text-emerald-50", ring: "ring-emerald-300" },
  { bg: "bg-violet-500", text: "text-violet-50", ring: "ring-violet-300" },
  { bg: "bg-fuchsia-500", text: "text-fuchsia-50", ring: "ring-fuchsia-300" },
  { bg: "bg-lime-500", text: "text-lime-50", ring: "ring-lime-300" },
  { bg: "bg-cyan-500", text: "text-cyan-50", ring: "ring-cyan-300" },
  { bg: "bg-orange-500", text: "text-orange-50", ring: "ring-orange-300" },
  { bg: "bg-teal-500", text: "text-teal-50", ring: "ring-teal-300" },
  { bg: "bg-indigo-500", text: "text-indigo-50", ring: "ring-indigo-300" },
  { bg: "bg-pink-500", text: "text-pink-50", ring: "ring-pink-300" },
] as const;

function hashString(input: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function colorForHost(hostId: string): HostColor {
  const palette = HOST_PALETTES[hashString(hostId) % HOST_PALETTES.length];
  return palette;
}

export function colorForType(type: ServerType): string {
  switch (type) {
    case "official":
      return "bg-blue-500";
    case "community":
      return "bg-emerald-500";
    case "modded":
      return "bg-fuchsia-500";
  }
}

export function colorForRestriction(r: PlayerRestriction): string {
  switch (r) {
    case "none":
      return "bg-slate-500";
    case "solo":
      return "bg-yellow-500";
    case "duo":
      return "bg-orange-500";
    case "trio":
      return "bg-red-500";
    case "quad":
      return "bg-purple-500";
    case "quintet":
      return "bg-indigo-500";
    case "other":
      return "bg-zinc-500";
  }
}

export const HOST_PALETTE_COUNT = HOST_PALETTES.length;
