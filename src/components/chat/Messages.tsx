"use client";

import { ChitchatCommonResponse } from "@/proto/api/api_chitchat";
import { Action } from "@/proto/api/api_common";
import WebSocketService from "@/websocket-client/openai-client";
import { useContext, useState } from "react";
import { ChatContext } from "./ChatContext";
import { generateRandomString } from "@/lib/utils";
import useMessages from "@/my-hooks/use-message";

const Messages = () => {
  const { addParamMessage } = useContext(ChatContext);
  const messages = useMessages();
  const [newContent, setNewContent] = useState<string>("");

  let client = WebSocketService.getInstance();

  const handleNewMessage = (data: any) => {
    const result = data as ChitchatCommonResponse;
    if (result.role === "assistant") {
    } else {
      if (result.finishReason === "") {
        setNewContent((prevContent) => prevContent + result.content);
      } else {
        addParamMessage(newContent, false);
        messages.addMessage({
          id: generateRandomString(12),
          text: newContent,
          isUserMessage: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "",
          fileId: "",
        });
        setNewContent("");
      }
    }
  };

  client.registerHandler(Action.EMBEDDING_QUERY_RESPONSE, handleNewMessage);
  return (
    <div>
      {messages.messages.map((message) => {
        return <p key={message.id}>{message.text}</p>;
      })}
      {newContent !== "" ? <p>{newContent}</p> : null}
    </div>
  );
};

export default Messages;
