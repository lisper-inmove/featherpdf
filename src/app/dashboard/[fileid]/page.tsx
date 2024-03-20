"use client";
import ChatWrapper from "@/components/ChatWrapper";
import PdfRenderer, { PdfRenderRef } from "@/components/PdfRenderer";
import { buttonVariants } from "@/components/ui/button";
import { clientTrpc } from "@/trpc-config/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useRef } from "react";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = ({ params }: PageProps) => {
  const { fileid } = params;
  const refForCloseSpectus = useRef<PdfRenderRef | null>(null);
  const { data, isLoading } = clientTrpc.getFile.useQuery(
    {
      fileId: fileid,
    },
    {
      refetchInterval: (data) => {
        return data?.file.uploadStatus === "SUCCESS" ||
          data?.file.uploadStatus === "FAILED"
          ? false
          : 5000;
      },
    },
  );

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>
      </div>
    );

  if (data?.file.uploadStatus === "PROCESSING")
    return (
      <div className="relative min-h-full flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">
              I&apos;m analysising your files. Include upload file and generate
              abstract.
            </h3>
            <p className="text-zinc-500 text-sm">This Won&apos;t take long.</p>
          </div>
        </div>
      </div>
    );

  if (data?.file.uploadStatus === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">
              Something Wrong with your PDF.
            </h3>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>
      </div>
    );

  if (!data) return notFound();

  return (
    <>
      <div
        className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]"
        onClick={() => {
          refForCloseSpectus.current?.closeConspectus();
        }}
      >
        <div className="mx-auto w-full grow lg:flex xl:px-2">
          {/* left side pdf renderer */}
          <div className="flex-1 xl:flex">
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
              <PdfRenderer
                url={data?.file.url}
                fileId={data?.file.id}
                ref={refForCloseSpectus}
              />
            </div>
          </div>
          {/* right side chat with pdf */}
          <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
            <ChatWrapper fileId={fileid} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
