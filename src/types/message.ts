import { AppRouter } from "@/trpc-config/router";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

// 推断出 getFileMessages接口返回 messages 的对象类型
type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
