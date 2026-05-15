import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();

const DTSTART = new Date("2026-01-01T19:00:00Z");

// Per-server "host:port" connect strings (used in-game with F1 → "client.connect <addr>"
// and via the Steam protocol "steam://connect/<addr>"). Stored on Server.connectUrl.
const CONNECT_URLS: Record<string, string> = {
  // BestRust monthly
  "seed-bestrust-solo-monthly": "141.11.117.130:28015",
  "seed-bestrust-duo-monthly": "141.11.117.133:28015",
  "seed-bestrust-trio-monthly": "141.11.117.134:28015",
  "seed-bestrust-quad-monthly": "141.11.117.135:28015",
  "seed-bestrust-max5-monthly": "141.11.117.136:28015",
  "seed-bestrust-main-monthly": "141.11.117.137:28015",
  // BestRust weekly
  "seed-bestrust-solo-weekly-1": "141.98.157.223:28015",
  "seed-bestrust-solo-weekly-2": "141.98.157.226:28015",
  "seed-bestrust-solo-weekly-3": "141.98.157.227:28015",
  "seed-bestrust-solo-weekly-6": "141.11.117.60:28015",
  "seed-bestrust-solo-weekly-8": "141.11.117.52:28015",
  "seed-bestrust-duo-weekly-1": "185.172.175.16:28015",
  "seed-bestrust-duo-weekly-2": "95.214.180.250:28015",
  "seed-bestrust-duo-weekly-3": "141.98.157.225:28015",
  "seed-bestrust-duo-weekly-4": "95.214.180.248:28015",
  "seed-bestrust-duo-weekly-5": "95.214.180.92:28015",
  "seed-bestrust-duo-weekly-8": "141.11.117.61:28015",
  "seed-bestrust-trio-weekly-1": "95.214.180.89:28015",
  "seed-bestrust-trio-weekly-2": "141.98.157.229:28015",
  "seed-bestrust-trio-weekly-3": "141.98.157.222:28015",
  "seed-bestrust-trio-weekly-4": "95.214.180.93:28015",
  "seed-bestrust-trio-weekly-5": "185.172.175.166:28015",
  "seed-bestrust-quad-weekly-1": "141.98.157.218:28015",
  "seed-bestrust-quad-weekly-4": "141.11.117.53:28015",
  "seed-bestrust-quad-weekly-6": "141.11.117.59:28015",
  "seed-bestrust-max5-weekly-6": "141.11.117.41:28015",
  "seed-bestrust-main-weekly": "141.11.117.68:28015",
  // RustVikings
  "seed-rustvikings-mon": "37.156.35.90:28026",
  "seed-rustvikings-tue": "37.156.35.90:28016",
  "seed-rustvikings-wed": "193.25.252.119:28016",
  "seed-rustvikings-thu": "37.156.35.90:28046",
  "seed-rustvikings-fri": "193.25.252.119:28046",
  "seed-rustvikings-sat": "193.25.252.119:28076",
  "seed-rustvikings-sun": "37.156.35.90:28036",
  // RustForNoobs (using the steam:// connect ports the user provided)
  "seed-rfn-trio-monthly": "64.40.9.26:28015",
  "seed-rfn-trio-weekly": "64.40.9.26:28020",
  "seed-rfn-duo-monthly": "168.100.161.54:28019",
  "seed-rfn-main-monthly": "168.100.161.142:28014",
  "seed-rfn-main-weekly": "168.100.161.237:28020",
  "seed-rfn-solo-weekly": "168.100.161.237:28015",
  "seed-rfn-duo-weekly": "168.100.161.244:28020",
  "seed-rfn-quad-weekly": "168.100.161.127:28020",
  "seed-rfn-quad-monthly": "64.40.8.61:28020",
  "seed-rfn-mondays-solo": "64.40.9.45:28015",
  "seed-rfn-mondays-duo": "64.40.9.45:28020",
  "seed-rfn-mondays-trio": "168.100.161.141:28015",
  "seed-rfn-mondays-main": "168.100.161.141:28020",
  "seed-rfn-2x-trio": "168.100.161.245:28020",
  "seed-rfn-5x-trio": "168.100.161.142:28020",
  "seed-rfn-10x-clans": "168.100.161.245:28015",
  // Rusticated
  "seed-rusticated-eu-main": "eu-main.rusticated.com:28010",
  "seed-rusticated-eu-long": "eu-long.rusticated.com:28010",
  "seed-rusticated-eu-medium": "eu-medium.rusticated.com:28010",
  "seed-rusticated-eu-trio-mon": "eu-trio-mon.rusticated.com:28010",
  "seed-rusticated-eu-trio-thurs": "eu-trio-thurs.rusticated.com:28010",
  "seed-rusticated-eu-hc-trio-thurs": "eu-hc-trio-thurs.rusticated.com:28010",
  // Reddit (only domains provided; default Rust port 28015)
  "seed-reddit-eu-hardcore": "eu.hardcore.rplayrust.com:28015",
  "seed-reddit-eu-lowpop": "eu.lowpop.rplayrust.com:28015",
  "seed-reddit-eu-main": "eu.main.rplayrust.com:28015",
  "seed-reddit-eu-medium": "eu.medium.rplayrust.com:28015",
  "seed-reddit-eu-monday": "eu.monday.rplayrust.com:28015",
  "seed-reddit-eu-monthly": "eu.monthly.rplayrust.com:28015",
  "seed-reddit-eu-small": "eu.small.rplayrust.com:28015",
  "seed-reddit-eu-trio": "eu.trio.rplayrust.com:28015",
  // Rustafied, Enjoy, Lagoon: no IPs provided — left blank intentionally.
};

// BestRust: 1st Thursday of the month at 19:45 CEST (= 17:45 UTC).
// Anchor at the most recent past occurrence so projections cover the current month.
const BESTRUST_DTSTART = new Date("2026-05-07T17:45:00Z");

const BESTRUST_MONTHLY_FORCED_EU: SeedSchedule = {
  rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=45;BYSECOND=0",
  timezone: "Europe/Paris",
  kind: "forced",
  label: "Monthly force wipe — 1st Thursday 19:45 CEST",
  dtstart: BESTRUST_DTSTART,
};

const BESTRUST_WEEKLY_DTSTART = new Date("2026-05-01T00:00:00Z");

type Byday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
const DAY_NAME: Record<Byday, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};

function bestrustWeekly(
  byday: Byday,
  hh: number,
  mm: number,
  wipeType: "map" | "full",
): SeedSchedule {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`,
    timezone: "Europe/Paris",
    kind: "weekly",
    label: `Weekly ${wipeType} wipe — ${DAY_NAME[byday]} ${pad(hh)}:${pad(mm)} CEST`,
    dtstart: BESTRUST_WEEKLY_DTSTART,
  };
}

type SeedSchedule = {
  rrule: string;
  timezone: string;
  kind: "weekly" | "biweekly" | "forced" | "custom";
  label: string;
  dtstart?: Date;
};

type SeedServer = {
  id: string;
  name: string;
  type: "official" | "community" | "modded";
  playerRestriction:
    | "none"
    | "solo"
    | "duo"
    | "trio"
    | "quad"
    | "quintet"
    | "other";
  region: string;
  tags: string[];
  schedules: SeedSchedule[];
  connectUrl?: string;
};

type SeedHost = {
  name: string;
  website: string;
  servers: SeedServer[];
};

const HOSTS: SeedHost[] = [
  {
    name: "BestRust",
    website: "https://bestrust.net",
    servers: [
      {
        id: "seed-bestrust-solo-monthly",
        name: "Bestrust Solo ONLY Monthly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      {
        id: "seed-bestrust-duo-monthly",
        name: "Bestrust Solo/Duo Monthly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      {
        id: "seed-bestrust-trio-monthly",
        name: "Bestrust Solo/Duo/Trio Monthly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      {
        id: "seed-bestrust-quad-monthly",
        name: "Bestrust Solo/Duo/Trio/Quad Monthly",
        type: "community",
        playerRestriction: "quad",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      {
        id: "seed-bestrust-max5-monthly",
        name: "Bestrust Solo/Duo/Trio/Quad/Max5 Monthly",
        type: "community",
        playerRestriction: "quintet",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      {
        id: "seed-bestrust-main-monthly",
        name: "Bestrust Main Monthly",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["monthly", "vanilla", "force-wipe-only"],
        schedules: [BESTRUST_MONTHLY_FORCED_EU],
      },
      // Weekly vanilla servers (EU). One schedule per server; day/time per Discord pin.
      {
        id: "seed-bestrust-solo-weekly-1",
        name: "Bestrust Solo ONLY - Weekly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["weekly", "vanilla", "map-wipe"],
        schedules: [bestrustWeekly("TH", 14, 45, "map")],
      },
      {
        id: "seed-bestrust-solo-weekly-2",
        name: "Bestrust Solo ONLY #2 - Weekly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SA", 14, 45, "full")],
      },
      {
        id: "seed-bestrust-solo-weekly-3",
        name: "Bestrust Solo ONLY #3 - Weekly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("WE", 12, 45, "full")],
      },
      {
        id: "seed-bestrust-solo-weekly-6",
        name: "Bestrust Solo ONLY #6 - Weekly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("TU", 14, 45, "full")],
      },
      {
        id: "seed-bestrust-solo-weekly-8",
        name: "Bestrust Solo ONLY #8 - Weekly",
        type: "community",
        playerRestriction: "solo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SU", 15, 45, "full")],
      },
      {
        id: "seed-bestrust-duo-weekly-1",
        name: "Bestrust Solo/Duo - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla", "map-wipe"],
        schedules: [bestrustWeekly("TH", 11, 45, "map")],
      },
      {
        id: "seed-bestrust-duo-weekly-2",
        name: "Bestrust Solo/Duo #2 - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("WE", 10, 45, "full")],
      },
      {
        id: "seed-bestrust-duo-weekly-3",
        name: "Bestrust Solo/Duo #3 - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SU", 10, 45, "full")],
      },
      {
        id: "seed-bestrust-duo-weekly-4",
        name: "Bestrust Solo/Duo #4 - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SA", 13, 45, "full")],
      },
      {
        id: "seed-bestrust-duo-weekly-5",
        name: "Bestrust Solo/Duo #5 - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("MO", 15, 45, "full")],
      },
      {
        id: "seed-bestrust-duo-weekly-8",
        name: "Bestrust Solo/Duo #8 - Weekly",
        type: "community",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("TU", 11, 45, "full")],
      },
      {
        id: "seed-bestrust-trio-weekly-1",
        name: "Bestrust Solo/Duo/Trio - Weekly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "vanilla", "map-wipe"],
        schedules: [bestrustWeekly("TH", 16, 45, "map")],
      },
      {
        id: "seed-bestrust-trio-weekly-2",
        name: "Bestrust Solo/Duo/Trio #2 - Weekly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("TU", 16, 45, "full")],
      },
      {
        id: "seed-bestrust-trio-weekly-3",
        name: "Bestrust Solo/Duo/Trio #3 - Weekly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SU", 13, 45, "full")],
      },
      {
        id: "seed-bestrust-trio-weekly-4",
        name: "Bestrust Solo/Duo/Trio #4 - Weekly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("FR", 18, 45, "full")],
      },
      {
        id: "seed-bestrust-trio-weekly-5",
        name: "Bestrust Solo/Duo/Trio #5 - Weekly",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SA", 15, 45, "full")],
      },
      {
        id: "seed-bestrust-quad-weekly-1",
        name: "Bestrust Solo/Duo/Trio/Quad - Weekly",
        type: "community",
        playerRestriction: "quad",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("FR", 16, 45, "full")],
      },
      {
        id: "seed-bestrust-quad-weekly-4",
        name: "Bestrust Solo/Duo/Trio/Quad #4",
        type: "community",
        playerRestriction: "quad",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SU", 17, 45, "full")],
      },
      {
        id: "seed-bestrust-quad-weekly-6",
        name: "Bestrust Solo/Duo/Trio/Quad #6 - Weekly",
        type: "community",
        playerRestriction: "quad",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("TU", 13, 45, "full")],
      },
      {
        id: "seed-bestrust-max5-weekly-6",
        name: "Bestrust Solo/Duo/Trio/Quad/Max5 #6",
        type: "community",
        playerRestriction: "quintet",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SU", 13, 45, "full")],
      },
      {
        id: "seed-bestrust-main-weekly",
        name: "Bestrust Main",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [bestrustWeekly("SA", 17, 45, "full")],
      },
    ],
  },
  {
    name: "RustForNoobs",
    website: "https://rustfornoobs.com",
    servers: (() => {
      const RFN_DTSTART = new Date("2026-04-01T00:00:00Z");
      const monthly = (label: string): SeedSchedule => ({
        rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "forced",
        label,
        dtstart: RFN_DTSTART,
      });
      const weekly = (byday: Byday, dayName: string): SeedSchedule => ({
        rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=17;BYMINUTE=0;BYSECOND=0`,
        timezone: "Europe/London",
        kind: "weekly",
        label: `Weekly wipe — ${dayName} 17:00 UK`,
        dtstart: RFN_DTSTART,
      });
      const m = monthly("Monthly map wipe — 1st Thursday (Facepunch update)");
      const wTh = weekly("TH", "Thursday");
      const wMo = weekly("MO", "Monday");
      type S = SeedServer;
      const list: S[] = [
        // Monthly map-wipe servers
        {
          id: "seed-rfn-trio-monthly",
          name: "RustForNoobs | Solo/Duo/Trio | Monthly",
          type: "community",
          playerRestriction: "trio",
          region: "EU",
          tags: ["monthly", "vanilla"],
          schedules: [m],
        },
        {
          id: "seed-rfn-duo-monthly",
          name: "RustForNoobs | Duo | Monthly",
          type: "community",
          playerRestriction: "duo",
          region: "EU",
          tags: ["monthly", "vanilla"],
          schedules: [m],
        },
        {
          id: "seed-rfn-main-monthly",
          name: "RustForNoobs | Main | Monthly",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "vanilla"],
          schedules: [m],
        },
        {
          id: "seed-rfn-quad-monthly",
          name: "RustForNoobs | Quad | Monthly",
          type: "community",
          playerRestriction: "quad",
          region: "EU",
          tags: ["monthly", "vanilla"],
          schedules: [m],
        },
        // Weekly Thursday servers
        {
          id: "seed-rfn-trio-weekly",
          name: "RustForNoobs | Solo/Duo/Trio | Weekly",
          type: "community",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-main-weekly",
          name: "RustForNoobs | Main | Weekly",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-solo-weekly",
          name: "RustForNoobs | Solo Only | Weekly",
          type: "community",
          playerRestriction: "solo",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-duo-weekly",
          name: "RustForNoobs | Duo | Weekly",
          type: "community",
          playerRestriction: "duo",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-quad-weekly",
          name: "RustForNoobs | Quad | Weekly",
          type: "community",
          playerRestriction: "quad",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wTh],
        },
        // Weekly Monday servers
        {
          id: "seed-rfn-mondays-solo",
          name: "RustForNoobs | Mondays | Solo",
          type: "community",
          playerRestriction: "solo",
          region: "EU",
          tags: ["weekly", "vanilla", "monday"],
          schedules: [wMo],
        },
        {
          id: "seed-rfn-mondays-duo",
          name: "RustForNoobs | Mondays | Duo",
          type: "community",
          playerRestriction: "duo",
          region: "EU",
          tags: ["weekly", "vanilla", "monday"],
          schedules: [wMo],
        },
        {
          id: "seed-rfn-mondays-trio",
          name: "RustForNoobs | Mondays | Trio",
          type: "community",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "vanilla", "monday"],
          schedules: [wMo],
        },
        {
          id: "seed-rfn-mondays-main",
          name: "RustForNoobs | Mondays | Main",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "vanilla", "monday"],
          schedules: [wMo],
        },
        // Modded weekly Thursday
        {
          id: "seed-rfn-2x-trio",
          name: "RustForNoobs | 2x | Solo/Duo/Trio",
          type: "modded",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "modded", "2x"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-5x-trio",
          name: "RustForNoobs | 5x | Solo/Duo/Trio",
          type: "modded",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "modded", "5x"],
          schedules: [wTh],
        },
        {
          id: "seed-rfn-10x-clans",
          name: "RustForNoobs | 10x | Clans | NoBPs | Kits",
          type: "modded",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "modded", "10x", "kits"],
          schedules: [wTh],
        },
      ];
      return list;
    })(),
  },
  {
    name: "Rustafied",
    website: "https://www.rustafied.com",
    servers: (() => {
      const RUSTAFIED_DTSTART = new Date("2026-04-01T00:00:00Z");
      // Biweekly servers wipe on 3rd & 5th Thursday → anchor at May 21 (3rd Thu of May 2026).
      const RUSTAFIED_BIWEEKLY_DTSTART = new Date("2026-05-21T14:00:00Z");
      const weekly = (byday: Byday, dayName: string): SeedSchedule => ({
        rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=15;BYMINUTE=0;BYSECOND=0`,
        timezone: "Europe/London",
        kind: "weekly",
        label: `Weekly wipe — ${dayName} 15:00 GMT`,
        dtstart: RUSTAFIED_DTSTART,
      });
      const biweeklyThu: SeedSchedule = {
        rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;BYHOUR=15;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "biweekly",
        label: "Bi-weekly wipe — Thursday 15:00 GMT",
        dtstart: RUSTAFIED_BIWEEKLY_DTSTART,
      };
      const monthlyForced: SeedSchedule = {
        rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=15;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "forced",
        label: "Monthly map wipe — 1st Thursday 15:00 GMT (Facepunch force wipe)",
        dtstart: RUSTAFIED_DTSTART,
      };
      const wThu = weekly("TH", "Thursday");
      const wFri = weekly("FR", "Friday");
      const wMon = weekly("MO", "Monday");
      const list: SeedServer[] = [
        // Weekly Thursday
        {
          id: "seed-rustafied-eu-main",
          name: "Rustafied EU Main",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly"],
          schedules: [wThu],
        },
        {
          id: "seed-rustafied-eu-small",
          name: "Rustafied EU Small",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "small"],
          schedules: [wThu],
        },
        {
          id: "seed-rustafied-eu-mini",
          name: "Rustafied EU Mini",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "mini"],
          schedules: [wThu],
        },
        {
          id: "seed-rustafied-eu-solo",
          name: "Rustafied EU Solo",
          type: "community",
          playerRestriction: "solo",
          region: "EU",
          tags: ["weekly", "solo"],
          schedules: [wThu],
        },
        {
          id: "seed-rustafied-eus",
          name: "Rustafied EUS",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly"],
          schedules: [wThu],
        },
        // Weekly Friday
        {
          id: "seed-rustafied-eu-friday",
          name: "Rustafied EU Friday",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "friday"],
          schedules: [wFri],
        },
        // Weekly Monday
        {
          id: "seed-rustafied-eu-monday",
          name: "Rustafied EU Monday",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "monday"],
          schedules: [wMon],
        },
        {
          id: "seed-rustafied-eu-small-monday",
          name: "Rustafied EU Small - Monday",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "monday", "small"],
          schedules: [wMon],
        },
        {
          id: "seed-rustafied-eu-trio-monday",
          name: "Rustafied EU Trio - Monday",
          type: "community",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "monday", "trio"],
          schedules: [wMon],
        },
        // Biweekly Thursday
        {
          id: "seed-rustafied-eu-medium-small",
          name: "Rustafied EU Medium - Small",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["biweekly", "medium"],
          schedules: [biweeklyThu],
        },
        {
          id: "seed-rustafied-eu-medium-large",
          name: "Rustafied EU Medium - Large",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["biweekly", "medium"],
          schedules: [biweeklyThu],
        },
        {
          id: "seed-rustafied-eu-trio",
          name: "Rustafied EU Trio",
          type: "community",
          playerRestriction: "trio",
          region: "EU",
          tags: ["biweekly", "trio"],
          schedules: [biweeklyThu],
        },
        // Monthly (1st Thursday)
        {
          id: "seed-rustafied-eu-long-small",
          name: "Rustafied EU Long - Small",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "long"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-rustafied-eu-long-small-2",
          name: "Rustafied EU Long - Small II",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "long"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-rustafied-eu-long-large",
          name: "Rustafied EU Long - Large",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "long"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-rustafied-eu-lowpop",
          name: "Rustafied EU Low Pop",
          type: "community",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "lowpop"],
          schedules: [monthlyForced],
        },
      ];
      return list.map((s) => ({ ...s, type: "official" as const }));
    })(),
  },
  {
    name: "Lagoon",
    website: "https://lagoonrust.com",
    servers: [
      {
        id: "seed-lagoon-eu-trio",
        name: "Lagoon EU | 1.5x Vanilla | Solo/Duo/Trio",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "1.5x", "vanilla"],
        schedules: [
          {
            rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=16;BYMINUTE=0;BYSECOND=0",
            timezone: "Europe/Paris",
            kind: "weekly",
            label: "Weekly wipe — Thursday 16:00 CEST",
            dtstart: new Date("2026-04-01T00:00:00Z"),
          },
        ],
      },
    ],
  },
  {
    name: "Enjoy",
    website: "https://enjoyrust.com",
    servers: (() => {
      const ENJOY_DTSTART = new Date("2026-04-01T00:00:00Z");
      // Solo/Duo biweekly anchored at most recent Thursday wipe (May 14, 2026 18:00 CEST = 16:00 UTC).
      const ENJOY_BIWEEKLY_DTSTART = new Date("2026-05-14T16:00:00Z");
      const monthlyForced: SeedSchedule = {
        rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=20;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/Paris",
        kind: "forced",
        label: "Monthly force-update wipe — 1st Thursday 20:00 CEST",
        dtstart: ENJOY_DTSTART,
      };
      const biweeklyThu: SeedSchedule = {
        rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;BYHOUR=18;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/Paris",
        kind: "biweekly",
        label: "Bi-weekly map wipe — Thursday 18:00 CEST",
        dtstart: ENJOY_BIWEEKLY_DTSTART,
      };
      const list: SeedServer[] = [
        {
          id: "seed-enjoy-solo-monthly",
          name: "Enjoy - Solo Only Monthly",
          type: "community",
          playerRestriction: "solo",
          region: "EU",
          tags: ["monthly", "vanilla", "no-bp-wipe", "true-vanilla"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-enjoy-solo-duo",
          name: "Enjoy - Solo/Duo",
          type: "community",
          playerRestriction: "duo",
          region: "EU",
          tags: ["biweekly", "vanilla", "no-bp-wipe", "true-vanilla"],
          schedules: [biweeklyThu, monthlyForced],
        },
      ];
      return list;
    })(),
  },
  {
    name: "Reddit",
    website: "https://rplayrust.com",
    servers: (() => {
      const REDDIT_DTSTART = new Date("2026-04-01T00:00:00Z");
      const REDDIT_BIWEEKLY_DTSTART = new Date("2026-05-07T14:00:00Z");
      const monthlyForced: SeedSchedule = {
        rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "forced",
        label: "Monthly force wipe — 1st Thursday 19:00 BST",
        dtstart: REDDIT_DTSTART,
      };
      const weekly = (byday: Byday, dayName: string): SeedSchedule => ({
        rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=15;BYMINUTE=0;BYSECOND=0`,
        timezone: "Europe/London",
        kind: "weekly",
        label: `Weekly wipe — ${dayName} 15:00 BST`,
        dtstart: REDDIT_DTSTART,
      });
      const biweeklyThu: SeedSchedule = {
        rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TH;BYHOUR=15;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "biweekly",
        label: "Bi-weekly wipe — Thursday 15:00 BST",
        dtstart: REDDIT_BIWEEKLY_DTSTART,
      };
      const wThu = weekly("TH", "Thursday");
      const wMon = weekly("MO", "Monday");
      const list: SeedServer[] = [
        {
          id: "seed-reddit-eu-hardcore",
          name: "Reddit EU Hardcore",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "hardcore"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-reddit-eu-lowpop",
          name: "Reddit EU Low Pop",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "lowpop"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-reddit-eu-main",
          name: "Reddit EU Main",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly"],
          schedules: [wThu],
        },
        {
          id: "seed-reddit-eu-medium",
          name: "Reddit EU Medium",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["biweekly", "medium"],
          schedules: [biweeklyThu],
        },
        {
          id: "seed-reddit-eu-monday",
          name: "Reddit EU Monday",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "monday"],
          schedules: [wMon],
        },
        {
          id: "seed-reddit-eu-monthly",
          name: "Reddit EU Monthly",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-reddit-eu-small",
          name: "Reddit EU Small",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "small"],
          schedules: [wThu],
        },
        {
          id: "seed-reddit-eu-trio",
          name: "Reddit EU Trio",
          type: "official",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "trio"],
          schedules: [wThu],
        },
      ];
      return list;
    })(),
  },
  {
    name: "Rusticated",
    website: "https://rusticated.com",
    servers: (() => {
      const RUST_DTSTART = new Date("2026-04-01T00:00:00Z");
      const monthlyForced: SeedSchedule = {
        rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0;BYSECOND=0",
        timezone: "Europe/London",
        kind: "forced",
        label: "Monthly force wipe — 1st Thursday 19:00 UK",
        dtstart: RUST_DTSTART,
      };
      const weeklyAt15 = (byday: Byday, dayName: string): SeedSchedule => ({
        rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=14;BYMINUTE=0;BYSECOND=0`,
        timezone: "Europe/London",
        kind: "weekly",
        label: `Weekly wipe — ${dayName} 14:00 UK`,
        dtstart: RUST_DTSTART,
      });
      const wThu = weeklyAt15("TH", "Thursday");
      const wMon = weeklyAt15("MO", "Monday");
      const list: SeedServer[] = [
        {
          id: "seed-rusticated-eu-main",
          name: "Rusticated EU Main",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wThu],
        },
        {
          id: "seed-rusticated-eu-long",
          name: "Rusticated EU Long",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["monthly", "vanilla", "long"],
          schedules: [monthlyForced],
        },
        {
          id: "seed-rusticated-eu-medium",
          name: "Rusticated EU Medium",
          type: "official",
          playerRestriction: "none",
          region: "EU",
          tags: ["weekly", "vanilla", "medium"],
          schedules: [wThu],
        },
        {
          id: "seed-rusticated-eu-trio-mon",
          name: "Rusticated EU Trio Monday",
          type: "official",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "vanilla", "monday"],
          schedules: [wMon],
        },
        {
          id: "seed-rusticated-eu-trio-thurs",
          name: "Rusticated EU Trio Thursday",
          type: "official",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "vanilla"],
          schedules: [wThu],
        },
        {
          id: "seed-rusticated-eu-hc-trio-thurs",
          name: "Rusticated EU Hardcore Trio Thursday",
          type: "official",
          playerRestriction: "trio",
          region: "EU",
          tags: ["weekly", "hardcore"],
          schedules: [wThu],
        },
      ];
      return list;
    })(),
  },
  {
    name: "RustVikings",
    website: "https://rustvikings.com",
    servers: (
      [
        ["MO", "Mondays", "seed-rustvikings-mon"],
        ["TU", "Tuesdays", "seed-rustvikings-tue"],
        ["WE", "Wednesdays", "seed-rustvikings-wed"],
        ["TH", "Thursdays", "seed-rustvikings-thu"],
        ["FR", "Fridays", "seed-rustvikings-fri"],
        ["SA", "Saturdays", "seed-rustvikings-sat"],
        ["SU", "Sundays", "seed-rustvikings-sun"],
      ] as const
    ).map(([byday, dayLabel, id]) => ({
      id,
      name: `RustVikings | Solo/Duo | ${dayLabel}`,
      type: "community" as const,
      playerRestriction: "duo" as const,
      region: "EU",
      tags: ["weekly", "vanilla"],
      schedules: [
        {
          rrule: `FREQ=WEEKLY;BYDAY=${byday};BYHOUR=17;BYMINUTE=0;BYSECOND=0`,
          timezone: "Europe/Paris",
          kind: "weekly" as const,
          label: `Weekly full wipe — ${DAY_NAME[byday]} 17:00 CEST`,
          dtstart: BESTRUST_WEEKLY_DTSTART,
        },
      ],
    })),
  },
];

async function seedHost(host: SeedHost): Promise<void> {
  const hostRow = await db.host.upsert({
    where: { name: host.name },
    update: { website: host.website },
    create: { name: host.name, website: host.website },
  });

  for (const server of host.servers) {
    const connectUrl = server.connectUrl ?? CONNECT_URLS[server.id] ?? null;
    const data: Prisma.ServerUncheckedCreateInput = {
      id: server.id,
      hostId: hostRow.id,
      name: server.name,
      type: server.type,
      playerRestriction: server.playerRestriction,
      region: server.region,
      tags: JSON.stringify(server.tags),
      connectUrl,
    };
    await db.server.upsert({
      where: { id: server.id },
      update: {
        hostId: data.hostId,
        name: data.name,
        type: data.type,
        playerRestriction: data.playerRestriction,
        region: data.region,
        tags: data.tags,
        connectUrl,
      },
      create: data,
    });

    await db.wipeScheduleRule.deleteMany({ where: { serverId: server.id } });
    await db.wipeScheduleRule.createMany({
      data: server.schedules.map((s) => ({
        serverId: server.id,
        rrule: s.rrule,
        dtstart: s.dtstart ?? DTSTART,
        timezone: s.timezone,
        kind: s.kind,
        label: s.label,
      })),
    });
  }
}

async function main(): Promise<void> {
  for (const host of HOSTS) {
    await seedHost(host);
  }
  console.log(`Seed complete: ${HOSTS.length} hosts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
