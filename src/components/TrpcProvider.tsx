"use client";

import React, { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { clientTrpc } from "@/trpc-config/client";

let token: string;

export const setToken = (newToken: string) => {
  token = `${newToken}-${Math.random()}`;
};

export const TrpcProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const url = process.env.NEXT_PUBLIC_TRPC_URL;

  const client = clientTrpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: url,
        headers() {
          return {
            Authorization: token,
          };
        },
      }),
    ],
  });

  return (
    <clientTrpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </clientTrpc.Provider>
  );
};
