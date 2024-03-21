"use client";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn, isInteger } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import SimpleBar from "simplebar-react";
import { clientTrpc } from "@/trpc-config/client";
import ReactMarkdown from "react-markdown";
import usePageNumber from "@/my-hooks/use-page-number";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
  fileId: string;
}

export interface PdfRenderRef {
  closeConspectus: () => void;
}

const PdfRenderer = (
  { url, fileId }: PdfRendererProps,
  ref: Ref<PdfRenderRef>,
) => {
  const { toast } = useToast();
  const { width, ref: resizeRef } = useResizeDetector();
  const pageState = usePageNumber();
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [isConspectusHover, setIsConspectusHover] = useState(false);
  const [isConspectusClick, setIsConspectusClick] = useState(false);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const isLoading = renderedScale !== scale;

  const { data: file } = clientTrpc.getFileConspectus.useQuery({
    id: fileId,
  });

  const [conspectusMessage, setConspectusMessage] = useState<string>("");
  useEffect(() => {
    if (file) {
      setConspectusMessage(file.conspectus);
    }
  }, [file, fileId]);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= pageState.numPages!),
  });
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    pageState.setCurrPage(Number(page));
    setValue("page", String(page));
  };

  const closeConspectus = () => {
    if (isConspectusClick || isConspectusHover) {
      setIsConspectusClick(false);
      setIsConspectusHover(false);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      closeConspectus: closeConspectus,
    };
  });

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={pageState.currPage <= 1}
            variant="ghost"
            aria-label="previous page"
            onClick={() => {
              pageState.setCurrPage(pageState.currPage - 1);
              setValue("page", String(pageState.currPage - 1));
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <input
              ref={pageInputRef}
              className={cn(
                "w-12 h-8 ring-1 ring-zinc-200 rounded-sm focus:ring-zinc-200 text-center",
              )}
              value={String(pageState.displayPage)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pageState.setCurrPage(
                    Number.parseInt(pageInputRef.current?.value),
                  );
                }
              }}
              onChange={(e) => {
                if (!isInteger(e.target.value)) {
                  toast({
                    title: "Not a Number",
                    description: `Please input a number not ' ${e.target.value} '`,
                    variant: "destructive",
                  });
                  return;
                }
                const newPageNumber = Number.parseInt(e.target.value);
                if (newPageNumber < 1 || newPageNumber > pageState.numPages) {
                  toast({
                    title: "Wrong number",
                    description: `Please input number between ${1} ~ ${pageState.numPages}`,
                    variant: "destructive",
                  });
                  pageState.setDisplayPage(pageState.currPage);
                } else {
                  pageState.setDisplayPage(Number.parseInt(e.target.value));
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{pageState.numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={pageState.currPage === pageState.numPages}
            variant="ghost"
            aria-label="next page"
            onClick={() => {
              pageState.setCurrPage(pageState.currPage + 1);
              setValue("page", String(pageState.currPage + 1));
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
        <div>{file && file.name}</div>
        <div className="space-x-2 flex items-center mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="w-4 h-4"></Search>
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50"></ChevronDown>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            aria-label="rotate 90 degrees"
            variant="ghost"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FileText
              onMouseEnter={() => setIsConspectusHover(true)}
              onMouseLeave={() => setIsConspectusHover(false)}
              onClick={() => {
                setIsConspectusClick(true);
              }}
              className="text-xl text-blue-300/95 cursor-pointer"
            />
            {(isConspectusClick || isConspectusHover) && (
              <div className="absolute z-50 max-w-3xl bg-zinc-200/40 backdrop-blur-lg p-4 rounded-md mt-2">
                <ReactMarkdown>{conspectusMessage}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-h-sccreen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={resizeRef}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => {
                pageState.setNumPages(numPages);
              }}
              file={url}
              className="max-h-full"
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={pageState.currPage}
                  key={"@" + renderedScale}
                  scale={scale}
                  rotate={rotation}
                />
              ) : null}
              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={pageState.currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin"></Loader2>
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default forwardRef(PdfRenderer);
