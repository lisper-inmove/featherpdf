import {
  Action,
  decodeRequest,
  encodeRequest,
  decodeResponse,
} from "@/proto/api/api_common";
import {
  EmbeddingPdfRequest,
  encodeEmbeddingPdfRequest,
} from "@/proto/api/featherpdf_api";
import { fileURLToPath } from "url";
import WebSocket from "ws";

// https://www.npmjs.com/package/ws

class WebSocketService {
  private SOCKET_URL = "wss://openai-client.inmove.top/ws";

  private ws: WebSocket | null = null;
  private static instance: WebSocketService | null = null;
  private openPromise: Promise<void>;

  private constructor() {
    this.ws = new WebSocket(this.SOCKET_URL);
    let resolveOpenPromise: () => void;
    this.openPromise = new Promise((resolve) => {
      resolveOpenPromise = resolve;
    });

    this.ws.on("open", () => {
      // const ping = encodeRequest({
      //   action: Action.PING,
      //   content: "Hello",
      // });
      // this.ws.send(ping);
      resolveOpenPromise(); // 解决打开Promise
    });

    // 接收到服务端的消息时
    this.ws.on("message", (data: any) => {
      const response = decodeResponse(new Uint8Array(data));
    });

    this.ws.on("close", () => {
      this.ws?.close();
      this.ws = null;
      WebSocketService.instance = null;
    });
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
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
}

export default WebSocketService;