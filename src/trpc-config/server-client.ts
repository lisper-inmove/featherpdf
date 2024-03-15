import { appRouter } from "@/trpc-config/router";
import { createCallerFactory } from ".";
import { createContext } from "./context";
const createCaller = createCallerFactory(appRouter);
// use server
export const serverClientTrpc = createCaller(createContext());
