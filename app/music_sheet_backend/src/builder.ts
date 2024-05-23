// src/builder.ts
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const builder = new SchemaBuilder({
  plugins: [PrismaPlugin, SimpleObjectsPlugin],
  prisma: {
    client: prisma,
  },
});

export { builder, prisma };
