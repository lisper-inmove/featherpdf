import { Message } from "@prisma/client";
import { create } from "zustand";

interface MessagesState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setContent: (content: string) => void;
}

const useMessages = create<MessagesState>((set) => ({
  messages: [],
  setContent: (content: string) => {
    set((state) => {
      if (state.messages.length > 0) {
        const newMessages = [...state.messages];
        newMessages[0] = {
          ...newMessages[0],
          text: content,
        };
        return { ...state, messages: newMessages };
      }
      return state;
    });
  },
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [message, ...state.messages],
    }));
  },
}));

export default useMessages;
