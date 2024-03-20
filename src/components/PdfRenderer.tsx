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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import SimpleBar from "simplebar-react";
import { clientTrpc } from "@/trpc-config/client";
import Markdown from "react-markdown";

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
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [isConspectusHover, setIsConspectusHover] = useState(true);
  const [isConspectusClick, setIsConspectusClick] = useState(false);
  const isLoading = renderedScale !== scale;

  const { data: fileConspectus } = clientTrpc.getFileConspectus.useQuery({
    id: fileId,
  });

  const [conspectusMessage, setConspectusMessage] = useState<string>("");
  useEffect(() => {
    if (fileConspectus) {
      setConspectusMessage(fileConspectus.conspectus);
    }
  }, [fileConspectus, fileId]);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
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
    setCurrPage(Number(page));
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
            disabled={currPage <= 1}
            variant="ghost"
            aria-label="previous page"
            onClick={() => {
              setCurrPage((prev) => {
                return prev - 1 > 1 ? prev - 1 : 1;
              });
              setValue("page", String(currPage - 1));
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              className={cn(
                "w-12 h-8 ring-1 ring-red-500/0",
                errors.page ? "focus-visible:ring-red-500" : "",
              )}
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            variant="ghost"
            aria-label="next page"
            onClick={() => {
              setCurrPage((prev) => {
                return prev + 1 < numPages! ? prev + 1 : numPages!;
              });
              setValue("page", String(currPage + 1));
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
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
                <Markdown>{conspectusMessage}</Markdown>
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
                setNumPages(numPages);
              }}
              file={url}
              className="max-h-full"
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  key={"@" + renderedScale}
                  scale={scale}
                  rotate={rotation}
                />
              ) : null}
              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin"></Loader2>
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
                inputRef={(ref) => {
                  console.log(ref);
                }}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default forwardRef(PdfRenderer);
