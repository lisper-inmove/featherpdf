import { createContext } from "@/trpc-config/context";
import { appRouter } from "@/trpc-config/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => await createContext(req),
  });
};

export { handler as GET, handler as POST };
