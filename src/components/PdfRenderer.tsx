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
import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
import { RenderZoomProps, zoomPlugin } from "@react-pdf-viewer/zoom";
import { RenderRotateProps, rotatePlugin } from "@react-pdf-viewer/rotate";

// Import the main component
import {
  Viewer,
  SpecialZoomLevel,
  RotateDirection,
  Worker,
} from "@react-pdf-viewer/core";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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

  const zoomPluginInstance = zoomPlugin();
  const { Zoom } = zoomPluginInstance;
  const rotatePluginInstance = rotatePlugin();
  const { Rotate } = rotatePluginInstance;

  const { data: file } = clientTrpc.getFileConspectus.useQuery({
    id: fileId,
  });

  const [conspectusMessage, setConspectusMessage] = useState<string>("");
  useEffect(() => {
    if (file) {
      setConspectusMessage(file.conspectus);
    }
  }, [file, fileId]);

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
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={pageState.currPage <= 1}
            variant="ghost"
            aria-label="previous page"
            onClick={() => {
              pageState.setCurrPage(pageState.currPage - 1);
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
                <ChevronDown className="h-2 w-2 opacity-50"></ChevronDown>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Zoom>
                  {(props: RenderZoomProps) => (
                    <p
                      onClick={() => {
                        props.onZoom(0.5);
                        setScale(0.5);
                      }}
                    >
                      50%
                    </p>
                  )}
                </Zoom>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zoom>
                  {(props: RenderZoomProps) => (
                    <p
                      onClick={() => {
                        props.onZoom(1);
                        setScale(1);
                      }}
                    >
                      100%
                    </p>
                  )}
                </Zoom>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zoom>
                  {(props: RenderZoomProps) => (
                    <p
                      onClick={() => {
                        props.onZoom(1.5);
                        setScale(1.5);
                      }}
                    >
                      150%
                    </p>
                  )}
                </Zoom>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zoom>
                  {(props: RenderZoomProps) => (
                    <p
                      onClick={() => {
                        props.onZoom(2);
                        setScale(2);
                      }}
                    >
                      200%
                    </p>
                  )}
                </Zoom>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Rotate direction={RotateDirection.Backward}>
            {(props: RenderRotateProps) => (
              <RotateCw
                className="h-4 w-4 hover:cursor-pointer"
                onClick={props.onClick}
              />
            )}
          </Rotate>
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
              className="text-blue-900/95 cursor-pointer"
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
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}
            >
              <Viewer
                plugins={[zoomPluginInstance, rotatePluginInstance]}
                fileUrl={url}
                initialPage={1}
                onZoom={(data) => {
                  console.log(data);
                }}
                onDocumentLoad={(data) => {
                  pageState.setNumPages(data.doc.numPages);
                }}
              ></Viewer>
            </Worker>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default forwardRef(PdfRenderer);
