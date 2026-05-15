import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();

const DTSTART = new Date("2026-01-01T19:00:00Z");

type SeedSchedule = {
  rrule: string;
  timezone: string;
  kind: "weekly" | "biweekly" | "forced" | "custom";
  label: string;
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
};

type SeedHost = {
  name: string;
  website: string;
  servers: SeedServer[];
};

const WEEKLY_THU_EU: SeedSchedule = {
  rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
  timezone: "Europe/London",
  kind: "weekly",
  label: "Weekly wipe — Thursday 7PM GMT",
};

const WEEKLY_THU_NA: SeedSchedule = {
  rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=15;BYMINUTE=0",
  timezone: "America/New_York",
  kind: "weekly",
  label: "Weekly wipe — Thursday 3PM ET",
};

const WEEKLY_FRI_EU: SeedSchedule = {
  rrule: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=19;BYMINUTE=0",
  timezone: "Europe/London",
  kind: "weekly",
  label: "Weekly wipe — Friday 7PM GMT",
};

const WEEKLY_SAT_NA: SeedSchedule = {
  rrule: "FREQ=WEEKLY;BYDAY=SA;BYHOUR=14;BYMINUTE=0",
  timezone: "America/Los_Angeles",
  kind: "weekly",
  label: "Weekly wipe — Saturday 2PM PT",
};

const WEEKLY_SUN_AS: SeedSchedule = {
  rrule: "FREQ=WEEKLY;BYDAY=SU;BYHOUR=19;BYMINUTE=0",
  timezone: "Asia/Singapore",
  kind: "weekly",
  label: "Weekly wipe — Sunday 7PM SGT",
};

const MONTHLY_FORCED_EU: SeedSchedule = {
  rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=19;BYMINUTE=0",
  timezone: "Europe/London",
  kind: "forced",
  label: "Monthly force wipe",
};

const MONTHLY_FORCED_NA: SeedSchedule = {
  rrule: "FREQ=MONTHLY;BYDAY=1TH;BYHOUR=15;BYMINUTE=0",
  timezone: "America/New_York",
  kind: "forced",
  label: "Monthly force wipe",
};

const HOSTS: SeedHost[] = [
  {
    name: "Rustoria",
    website: "https://rustoria.co",
    servers: [
      {
        id: "seed-rustoria-trio",
        name: "Rustoria.co - Trio",
        type: "community",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "trio", "vanilla"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
      {
        id: "seed-rustoria-duo",
        name: "Rustoria.co - Duo",
        type: "community",
        playerRestriction: "duo",
        region: "NA",
        tags: ["weekly", "duo"],
        schedules: [WEEKLY_THU_NA],
      },
      {
        id: "seed-rustoria-main",
        name: "Rustoria.co - Main",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["weekly", "main"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
    ],
  },
  {
    name: "Rustafied",
    website: "https://rustafied.com",
    servers: [
      {
        id: "seed-rustafied-eu-main",
        name: "Rustafied EU - Main",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["weekly", "vanilla"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
      {
        id: "seed-rustafied-us-medium",
        name: "Rustafied US - Medium",
        type: "community",
        playerRestriction: "none",
        region: "NA",
        tags: ["weekly", "medium"],
        schedules: [WEEKLY_THU_NA],
      },
      {
        id: "seed-rustafied-us-trio",
        name: "Rustafied US - Trio",
        type: "community",
        playerRestriction: "trio",
        region: "NA",
        tags: ["weekly", "trio"],
        schedules: [WEEKLY_THU_NA, MONTHLY_FORCED_NA],
      },
      {
        id: "seed-rustafied-eu-long",
        name: "Rustafied EU - Long",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["biweekly", "long"],
        schedules: [WEEKLY_FRI_EU],
      },
    ],
  },
  {
    name: "Reddit",
    website: "https://playrust.com",
    servers: [
      {
        id: "seed-reddit-eu",
        name: "Reddit.com EU",
        type: "community",
        playerRestriction: "none",
        region: "EU",
        tags: ["weekly", "official-style"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
      {
        id: "seed-reddit-us",
        name: "Reddit.com US",
        type: "community",
        playerRestriction: "none",
        region: "NA",
        tags: ["weekly", "official-style"],
        schedules: [WEEKLY_THU_NA, MONTHLY_FORCED_NA],
      },
    ],
  },
  {
    name: "Facepunch Official",
    website: "https://facepunch.com",
    servers: [
      {
        id: "seed-facepunch-eu-medium",
        name: "Facepunch EU Medium I",
        type: "official",
        playerRestriction: "none",
        region: "EU",
        tags: ["weekly", "official"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
      {
        id: "seed-facepunch-us-large",
        name: "Facepunch US Large II",
        type: "official",
        playerRestriction: "none",
        region: "NA",
        tags: ["weekly", "official"],
        schedules: [WEEKLY_THU_NA, MONTHLY_FORCED_NA],
      },
      {
        id: "seed-facepunch-as-small",
        name: "Facepunch AS Small I",
        type: "official",
        playerRestriction: "none",
        region: "AS",
        tags: ["weekly", "official"],
        schedules: [WEEKLY_SUN_AS],
      },
    ],
  },
  {
    name: "Pickle",
    website: "https://picklerust.com",
    servers: [
      {
        id: "seed-pickle-solo-duo-trio-long",
        name: "Pickle Solo/Duo/Trio - US Long",
        type: "community",
        playerRestriction: "trio",
        region: "NA",
        tags: ["biweekly", "trio", "long"],
        schedules: [WEEKLY_THU_NA],
      },
      {
        id: "seed-pickle-quad",
        name: "Pickle Quad - US",
        type: "community",
        playerRestriction: "quad",
        region: "NA",
        tags: ["weekly", "quad"],
        schedules: [WEEKLY_THU_NA, MONTHLY_FORCED_NA],
      },
      {
        id: "seed-pickle-solo",
        name: "Pickle Solo Only - US",
        type: "community",
        playerRestriction: "solo",
        region: "NA",
        tags: ["weekly", "solo"],
        schedules: [WEEKLY_SAT_NA],
      },
    ],
  },
  {
    name: "Vital",
    website: "https://vitalrust.com",
    servers: [
      {
        id: "seed-vital-trio",
        name: "Vital Rust - Trio",
        type: "modded",
        playerRestriction: "trio",
        region: "EU",
        tags: ["weekly", "trio", "modded"],
        schedules: [WEEKLY_THU_EU, MONTHLY_FORCED_EU],
      },
      {
        id: "seed-vital-duo",
        name: "Vital Rust - Duo",
        type: "modded",
        playerRestriction: "duo",
        region: "EU",
        tags: ["weekly", "duo", "modded"],
        schedules: [WEEKLY_FRI_EU],
      },
    ],
  },
];

async function seedHost(host: SeedHost): Promise<void> {
  const hostRow = await db.host.upsert({
    where: { name: host.name },
    update: { website: host.website },
    create: { name: host.name, website: host.website },
  });

  for (const server of host.servers) {
    const data: Prisma.ServerUncheckedCreateInput = {
      id: server.id,
      hostId: hostRow.id,
      name: server.name,
      type: server.type,
      playerRestriction: server.playerRestriction,
      region: server.region,
      tags: JSON.stringify(server.tags),
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
      },
      create: data,
    });

    await db.wipeScheduleRule.deleteMany({ where: { serverId: server.id } });
    await db.wipeScheduleRule.createMany({
      data: server.schedules.map((s) => ({
        serverId: server.id,
        rrule: s.rrule,
        dtstart: DTSTART,
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
