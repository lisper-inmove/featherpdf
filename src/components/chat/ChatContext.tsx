import React, { ReactNode, createContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useMessages from "@/my-hooks/use-message";

type StreamResponse = {
  addMessage: () => void;
  addParamMessage: (
    message: string,
    addToContext?: boolean,
    isUserMessage?: boolean,
  ) => void;
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
  const { addMessage: addMessageLocal, resetMessages } = useMessages();
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({
      message,
      addToContext = true,
      isUserMessage = true,
    }: {
      message: string;
      addToContext?: boolean;
      isUserMessage?: boolean;
    }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
          isUserMessage,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const result = await response.json();
      if (addToContext !== false) {
        addMessageLocal(result);
      }
      return result;
    },
  });

  const addMessage = () => {
    return sendMessage({ message });
  };
  const addParamMessage = (
    message: string,
    addToContext?: boolean,
    isUserMessage?: boolean,
  ) => {
    return sendMessage({ message, addToContext, isUserMessage });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    return () => {
      resetMessages();
    };
  }, [resetMessages]);
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
