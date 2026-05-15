import { z } from "zod";

export const ServerType = z.enum(["official", "community", "modded"]);
export type ServerType = z.infer<typeof ServerType>;

export const PlayerRestriction = z.enum([
  "none",
  "solo",
  "duo",
  "trio",
  "quad",
  "quintet",
  "other",
]);
export type PlayerRestriction = z.infer<typeof PlayerRestriction>;

export const ScheduleKind = z.enum(["weekly", "biweekly", "forced", "custom"]);
export type ScheduleKind = z.infer<typeof ScheduleKind>;

export const HostSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable().optional(),
  discordGuild: z.string().nullable().optional(),
  discordInvite: z.string().nullable().optional(),
});
export type Host = z.infer<typeof HostSchema>;

export const ServerSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  name: z.string(),
  type: ServerType,
  playerRestriction: PlayerRestriction,
  region: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  battlemetricsId: z.string().nullable().optional(),
  lastWipeAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type Server = z.infer<typeof ServerSchema>;

export const WipeScheduleRuleSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  rrule: z.string(),
  dtstart: z.coerce.date(),
  timezone: z.string().default("UTC"),
  kind: ScheduleKind,
  label: z.string().nullable().optional(),
});
export type WipeScheduleRule = z.infer<typeof WipeScheduleRuleSchema>;

export const WipeEventOverrideSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  occursAt: z.coerce.date(),
  skip: z.boolean().default(false),
  label: z.string().nullable().optional(),
});
export type WipeEventOverride = z.infer<typeof WipeEventOverrideSchema>;

/** A concrete projected wipe event (returned by /api/wipes and the recurrence engine). */
export const WipeEventSchema = z.object({
  serverId: z.string(),
  serverName: z.string(),
  hostId: z.string(),
  hostName: z.string(),
  type: ServerType,
  playerRestriction: PlayerRestriction,
  region: z.string().nullable().optional(),
  occursAt: z.coerce.date(),
  kind: ScheduleKind,
  label: z.string().nullable().optional(),
});
export type WipeEvent = z.infer<typeof WipeEventSchema>;

export const WipeQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  types: z.array(ServerType).optional(),
  restrictions: z.array(PlayerRestriction).optional(),
  hostIds: z.array(z.string()).optional(),
  serverIds: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});
export type WipeQuery = z.infer<typeof WipeQuerySchema>;
