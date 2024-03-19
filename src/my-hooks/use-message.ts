import { Message } from "@prisma/client";
import { create } from "zustand";

interface MessagesState {
  messages: Message[];
  addMessage: (message: Message) => void;
  loadMessage: () => void;
}

const useMessages = create<MessagesState>((set) => ({
  messages: [],
  loadMessage: () => ({}),
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));

export default useMessages;
