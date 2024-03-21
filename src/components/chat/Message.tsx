import { cn } from "@/lib/utils";
import { Message as MessageEntity } from "@prisma/client";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { forwardRef } from "react";
import usePageNumber from "@/my-hooks/use-page-number";

interface MessageProps {
  message: MessageEntity;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }: MessageProps, ref) => {
    const pageState = usePageNumber();
    return (
      <>
        <div
          ref={ref}
          className={cn("flex items-end", {
            "justify-end": message.isUserMessage,
          })}
        >
          <div
            className={cn(
              "relative flex h-6 w-6 aspect-square items-center justify-center",
              {
                "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
                "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
                invisible: isNextMessageSamePerson,
              },
            )}
          >
            {message.isUserMessage ? (
              <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
            ) : (
              <Icons.bot className="fill-zinc-300 h-3/4 w-3/4" />
            )}
          </div>
          <div
            className={cn("flex flex-col space-y-2 text-base mx-2 w-3/4", {
              "order-1 items-end": message.isUserMessage,
              "order-2 items-start": !message.isUserMessage,
            })}
          >
            <div
              className={cn("px-4 py-2 rounded-lg inline-block", {
                "bg-blue-600 text-white": message.isUserMessage,
                "bg-gray-200 text-gray-900": !message.isUserMessage,
                "rounded-br-none":
                  !isNextMessageSamePerson && message.isUserMessage,
                "rounded-bl-none":
                  !isNextMessageSamePerson && !message.isUserMessage,
              })}
            >
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessage,
                })}
                components={{
                  a({ node, children, ...props }) {
                    console.log(props);
                    const pageNumber = Number.parseInt(props.href);
                    return (
                      <a
                        {...props}
                        className="text-white inline-block bg-blue-200 px-2 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          pageState.setCurrPage(pageNumber);
                        }}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </>
    );
  },
);

Message.displayName = "Message";

export default Message;
