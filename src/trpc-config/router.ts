import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./index";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/constants/constant";

export const appRouter = router({
  test: publicProcedure.query(() => {
    return "hello";
  }),
  userSession: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return { code: "success", user: user };
  }),
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }
    return { code: "success" };
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      const messages = await db.message.findMany({
        take: limit + 1, // extra one is for next cursor
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem.id;
      }
      return {
        messages,
        nextCursor,
      };
    }),
  getFile: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });
      if (!file) return { status: "PENDING" as const };
      return { file: file };
    }),
  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });
      if (!file) return { status: "PENDING" as const };
      return { status: file.uploadStatus };
    }),
  getFileConspectus: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
        select: {
          conspectus: true,
          uploadStatus: true,
          name: true,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      return file;
    }),
  getFileId: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
        select: {
          id: true,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      return file;
    }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const files = await db.file.findMany({
      where: {
        userId,
      },
    });
    return files;
  }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
        },
      });
      return file;
    }),
  addMessage: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
        message: z.string(),
        isUserMessage: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: userId,
        },
      });
      if (!file) return { code: "fail" };
      const result = await db.message.create({
        data: {
          text: input.message,
          isUserMessage: input.isUserMessage,
          userId: userId,
          fileId: input.fileId,
        },
      });
      console.log("addMessage", result);
      return { code: "success", message: result };
    }),
});

export type AppRouter = typeof appRouter;
