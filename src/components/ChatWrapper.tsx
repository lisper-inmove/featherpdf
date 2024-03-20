"use client";
import ChatInput from "./chat/ChatInput";
import Messages from "./chat/Messages";
import { ChatContextProvider } from "./chat/ChatContext";

interface ChatWrapperProps {
  fileId: string;
}

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex-col mb-28">
          <Messages fileId={fileId} />
        </div>
        <ChatInput fileId={fileId} />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
