import React, { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Message } from "@prisma/client";
import useMessages from "@/my-hooks/use-message";

type StreamResponse = {
  addMessage: () => void;
  addParamMessage: (message: string, addToContext?: boolean) => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  addParamMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const messages = useMessages();
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({
      message,
      addToContext,
    }: {
      message: string;
      addToContext?: boolean;
    }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const result = await response.json();
      if (addToContext !== false) {
        messages.addMessage(result);
      }
      return result;
    },
  });

  const addMessage = () => {
    return sendMessage({ message });
  };
  const addParamMessage = (message: string, addToContext?: boolean) => {
    return sendMessage({ message, addToContext });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
        addParamMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
