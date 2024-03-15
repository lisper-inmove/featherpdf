import { inferAsyncReturnType } from "@trpc/server";

export interface ContextType {}

export const createContext = async (req?: Request) => {
  return {};
};

export type Context = inferAsyncReturnType<typeof createContext>;
