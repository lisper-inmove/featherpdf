"use client";

import { ChitchatCommonResponse } from "@/proto/api/api_chitchat";
import { Action } from "@/proto/api/api_common";
import WebSocketService from "@/websocket-client/openai-client";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import { generateRandomString } from "@/lib/utils";
import useMessages from "@/my-hooks/use-message";
import { clientTrpc } from "@/trpc-config/client";
import { INFINITE_QUERY_LIMIT } from "@/constants/constant";
import Skeleton from "react-loading-skeleton";
import { MessageSquare } from "lucide-react";
import Message from "./Message";
import { useIntersection } from "@mantine/hooks";

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { addParamMessage } = useContext(ChatContext);
  const { messages, resetMessages, addMessage, setContent } = useMessages();
  const [newContent, setNewContent] = useState<string>("");
  let prevMessage = null;

  let client = WebSocketService.getInstance();

  const { data, isLoading, fetchNextPage } =
    clientTrpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      },
    );
  const dbMessages = data?.pages.flatMap((page) => page.messages);

  const handleNewMessage = (data: any) => {
    const result = data as ChitchatCommonResponse;
    if (result.role === "assistant") {
      addMessage({
        id: generateRandomString(12),
        text: newContent,
        isUserMessage: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "",
        fileId: fileId,
      });
    } else {
      if (result.finishReason === "") {
        setNewContent((prevContent) => prevContent + result.content);
        setContent(newContent + result.content);
      } else {
        addParamMessage(newContent, false, false);
        setNewContent("");
      }
    }
  };

  // pull up load
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  useEffect(() => {
    return () => {
      resetMessages();
    };
  }, [resetMessages]);

  client.registerHandler(Action.EMBEDDING_QUERY_RESPONSE, handleNewMessage);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollerbar-w-2 scrolling-touch">
      {(dbMessages && dbMessages.length > 0) ||
      (messages && messages.length > 0) ? (
        messages.concat(dbMessages).map((message, index) => {
          let isNextMessageSamePerson = false;
          if (!prevMessage) {
            prevMessage = message;
          } else {
            isNextMessageSamePerson =
              prevMessage.isUserMessage === message.isUserMessage;
          }
          if (dbMessages && index === dbMessages.length - 1) {
            return (
              <Message
                ref={ref}
                key={message.id}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
              />
            );
          } else {
            return (
              <Message
                key={message.id}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
              />
            );
          }
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
