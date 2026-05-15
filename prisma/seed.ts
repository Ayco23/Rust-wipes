import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const rustoria = await db.host.upsert({
    where: { name: "Rustoria" },
    update: {},
    create: { name: "Rustoria", website: "https://rustoria.co" },
  });

  await db.server.upsert({
    where: { id: "seed-rustoria-trio" },
    update: {},
    create: {
      id: "seed-rustoria-trio",
      hostId: rustoria.id,
      name: "Rustoria.co - Trio",
      type: "community",
      playerRestriction: "trio",
      region: "EU",
      tags: JSON.stringify(["weekly", "trio"]),
      schedules: {
        create: [
          {
            kind: "weekly",
            rrule: "FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0",
            dtstart: new Date("2026-01-01T19:00:00Z"),
            timezone: "Europe/London",
            label: "Weekly wipe — Thursday 7PM GMT",
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
