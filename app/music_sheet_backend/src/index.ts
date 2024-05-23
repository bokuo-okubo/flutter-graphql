import express from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./schema";
import { prisma } from "./builder";

const app = express();
const server = new ApolloServer({
  schema,
  context: () => ({ prisma }),
});

server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
});
