"use client";
import { linkDashboard, linkHome } from "@/constants/link-href";
import { clientTrpc } from "@/trpc-config/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = ({ searchParams }: PageProps) => {
  const router = useRouter();
  const origin = searchParams.origin;

  const { data, isLoading, error, isError } =
    clientTrpc.authCallback.useQuery();
  if (isError) {
    if (error.data?.code === "UNAUTHORIZED") {
      router.push(linkHome);
    }
  }
  if (!isError && !isLoading) {
    router.push(origin ? `/${origin}` : linkDashboard);
  }
  return (
    <>
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800"></Loader2>
          <h3 className="font-semibold text-xl">Setting up your account...</h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    </>
  );
};

export default Page;
