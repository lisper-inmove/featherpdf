import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import WebSocketService from "@/websocket-client/openai-client";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = `https://utfs.io/f/${file.key}`;
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          // url: file.url,
          url: fileUrl,
          uploadStatus: "SUCCESS",
        },
      });
      try {
        let wsclient = WebSocketService.getInstance();
        wsclient.embeddingPdf({
          fileUrl,
          filename: file.name,
          indexName: "featherpdf",
          fileId: createdFile.id,
        });
      } catch (error) {}
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
