import { builder } from "./builder";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Userモデルの定義
builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    sheets: t.relation("sheets"),
  }),
});

// Sheetモデルの定義
builder.prismaObject("Sheet", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    composer: t.exposeString("composer"),
    arranger: t.exposeString("arranger"),
    content: t.exposeString("content"),
    user: t.relation("user"),
  }),
});

// クエリの定義
builder.queryType({
  fields: (t) => ({
    users: t.prismaField({
      type: ["User"],
      resolve: (query, _parent, _args, { prisma }) =>
        prisma.user.findMany({ ...query }),
    }),
    sheets: t.prismaField({
      type: ["Sheet"],
      resolve: (query, _parent, _args, { prisma }) =>
        prisma.sheet.findMany({ ...query }),
    }),
  }),
});

// ミューテーションの定義
builder.mutationType({
  fields: (t) => ({
    register: t.field({
      type: "User",
      args: {
        email: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
      },
      resolve: async (_parent, { email, password }, { prisma }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        return prisma.user.create({
          data: { email, password: hashedPassword },
        });
      },
    }),
    login: t.field({
      type: "String",
      args: {
        email: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
      },
      resolve: async (_parent, { email, password }, { prisma }) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          throw new Error("Invalid credentials");
        }
        return jwt.sign({ userId: user.id }, "your_secret_key");
      },
    }),
    createSheet: t.prismaField({
      type: "Sheet",
      args: {
        title: t.arg.string({ required: true }),
        composer: t.arg.string({ required: true }),
        arranger: t.arg.string({ required: true }),
        content: t.arg.string({ required: true }),
      },
      resolve: (
        query,
        _parent,
        { title, composer, arranger, content },
        { prisma }
      ) => {
        return prisma.sheet.create({
          data: {
            title,
            composer,
            arranger,
            content,
            user: { connect: { id: 1 } }, // Assuming user ID is 1 for simplicity
          },
          ...query,
        });
      },
    }),
  }),
});

// スキーマのエクスポート
export const schema = builder.toSchema();
