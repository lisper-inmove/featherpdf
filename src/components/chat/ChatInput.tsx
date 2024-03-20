import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import WebSocketService from "@/websocket-client/openai-client";
import { PIONCONE_INDEX_NAME } from "@/constants/constant";

interface ChatInputProps {
  isDisabled?: boolean;
  fileId?: string;
}

const ChatInput = ({ isDisabled, fileId }: ChatInputProps) => {
  const { addParamMessage, isLoading } = useContext(ChatContext);

  const textareRef = useRef<HTMLTextAreaElement>();
  let client = WebSocketService.getInstance();

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                ref={textareRef}
                maxRows={4}
                placeholder="Enter your question..."
                autoFocus
                onChange={(e) => {
                  e.preventDefault();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addParamMessage(textareRef.current?.value);
                    client.embeddingTextQuery({
                      text: textareRef.current?.value,
                      indexName: PIONCONE_INDEX_NAME,
                      fileId,
                    });
                    textareRef.current.value = "";
                    textareRef.current?.focus();
                  }
                }}
                rows={1}
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />
              <Button
                disabled={isLoading || isDisabled}
                aria-label="send message"
                className="absolute bottom-1.5 right-[8px]"
                onClick={(e) => {
                  e.preventDefault();
                  addParamMessage(textareRef.current?.value);
                  client.embeddingTextQuery({
                    text: textareRef.current?.value,
                    indexName: PIONCONE_INDEX_NAME,
                    fileId,
                  });
                  textareRef.current.value = "";
                  textareRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
