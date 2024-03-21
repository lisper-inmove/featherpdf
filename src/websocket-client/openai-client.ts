import {
  Action,
  Response,
  decodeResponse,
  encodeRequest,
} from "@/proto/api/api_common";
import {
  EmbeddingPdfRequest,
  QueryTextRequest,
  ReadPdfRequest,
} from "@/proto/api/api_featherpdf";
import ReconnectingWebSocket from "reconnecting-websocket";

type THandler = Map<string, (response: any) => void>;

class WebSocketService {
  private SOCKET_URL = "wss://openai-client.inmove.top/ws";
  private ws: null | ReconnectingWebSocket = null;
  private static instance: WebSocketService;
  private openPromise: Promise<void>;
  private handlers: THandler = new Map();

  private constructor() {
    this.ws = new ReconnectingWebSocket(this.SOCKET_URL);
    let resolveOpenPromise: () => void;
    this.openPromise = new Promise((resolve) => {
      resolveOpenPromise = resolve;
    });
    this.ws.addEventListener("open", () => {
      // 连接成功之后解开promise
      resolveOpenPromise();
    });
    this.ws.addEventListener("message", (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        // 如果数据是Blob类型，使用FileReader读取
        const reader = new FileReader();
        reader.onload = () => {
          const content = decodeResponse(
            new Uint8Array(reader.result as ArrayBuffer),
          );
        };
        reader.readAsText(event.data);
      } else {
        const data = JSON.parse(event.data) as Response;
        if (this.handlers.get(data.action)) {
          const content = JSON.parse(data.content);
          this.handlers.get(data.action)(content);
        }
      }
    });
  }

  public registerHandler(action: Action, handler: (response: any) => void) {
    this.handlers.set(action, handler);
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async readPdf(req: ReadPdfRequest) {
    await this.openPromise;
    const request = encodeRequest({
      action: Action.READ_PDF_REQUEST,
      content: JSON.stringify({
        fileId: req.fileId,
        fileUrl: req.fileUrl,
      }),
    });
    this.ws?.send(request);
  }

  public async embeddingTextQuery(req: QueryTextRequest) {
    await this.openPromise;
    const request = encodeRequest({
      action: Action.EMBEDDING_QUERY_TEXT,
      content: JSON.stringify({
        text: req.text,
        indexName: req.indexName,
        fileId: req.fileId,
      }),
    });
    this.ws?.send(request);
  }

  public async embeddingPdf(req: EmbeddingPdfRequest) {
    await this.openPromise;
    const request = encodeRequest({
      action: Action.EMBEDDING_PDF,
      content: JSON.stringify({
        fileUrl: req.fileUrl,
        filename: req.filename,
        indexName: req.indexName,
        fileId: req.fileId,
      }),
    });
    this.ws?.send(request);
  }

  public async sendHello() {
    await this.openPromise;
    this.ws.send(
      encodeRequest({
        action: Action.EMBEDDING_QUERY_TEXT,
        content: JSON.stringify({
          text: "Chopin 什么时候出生的?",
          indexName: "featherpdf",
          fileId: "123",
        }),
      }),
    );
  }
}

export default WebSocketService;
