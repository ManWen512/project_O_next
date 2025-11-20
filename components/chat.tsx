"use client";

import { CircleArrowOutUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { SidebarTrigger } from "./ui/sidebar";
import { useGetChatsQuery } from "@/services/aiChat";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { IconBrandOpenai } from "@tabler/icons-react";
import { Spinner } from "./ui/spinner";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";

type LocalChat = { _id?: string; prompt: string | null; output: string };

export function Chat() {
  const {
    data: chats,
    isLoading: chatsloading,
    error: chatsError,
  } = useGetChatsQuery();
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { data: session } = useSession();

  // local messages including streaming text

  const [localChats, setLocalChats] = useState<LocalChat[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localChats]);

  // merge server + local messages
  const mergedChats = [...(chats?.data || []), ...localChats];

  //The response appears fast because the HuggingFace API is sending the entire response in
  //  large chunks instead of token-by-token
  const handleSend = async () => {
    if (!message.trim()) return;
    if (!session) return;

    const userMsg = { prompt: message, output: "" };

    // append user message locally
    setLocalChats((prev) => [...prev, userMsg]);

    const promptText = message;
    setMessage("");
    setStreaming(true);

    const evt = new EventSource(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }ai/stream?prompt=${encodeURIComponent(promptText)}&token=${
        session?.accessToken
      }`
    );
    let aiMsg = { prompt: null, output: "" };

    evt.onmessage = (e) => {
      aiMsg.output += e.data;

      // update last streaming message
      setLocalChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].output = aiMsg.output;
        return updated;
      });
    };

    evt.addEventListener("done", () => {
      evt.close();
      setStreaming(false);
    });

    evt.onerror = () => {
      evt.close();
      setStreaming(false);
    };
  };

  return (
    <div className=" flex flex-col justify-between h-[88vh]">
      {/* Model tag */}
      <div className="flex mt-2">
        <Card className="p-2 text-xs flex gap-2 items-center flex-row bg-gray-100">
          <IconBrandOpenai className="w-4 h-4 " />
          <p>Gpt-oss-120b</p>
        </Card>
      </div>

      {chatsloading && ( <div className="flex justify-center "><Spinner className="bg-gray-200 rounded-full w-7 h-7 p-1"/></div>)}

      {/* Scrollable chat area */}

      <div className="flex-1  my-2">
        <ScrollArea className="h-[70vh] ">
          {mergedChats?.map((chat, index) => (
            <div key={`${chat._id || index}-${chat.output.length}`} className="mr-3">
              {chat.prompt && (
                <div className="flex justify-end ml-20 sm:ml-60 ">
                  <Card className="p-4 my-2 bg-gray-100 text-sm">
                    {chat.prompt}
                  </Card>
                </div>
              )}
              <Card className="p-4 my-2 inline-block ">
                <div className="markdown prose prose-sm max-w-none leading-relaxed">
                  <ReactMarkdown  key={chat.output.length} remarkPlugins={[remarkGfm]}>
                    {chat.output}
                  </ReactMarkdown>
                </div>
              </Card>
            </div>
          ))}
          <div ref={bottomRef} />
        </ScrollArea>
      </div>

      {/* Input box at bottom */}
      <div className="fixed bottom-0  right-0 bg-white  sm:w-4/5 w-full  p-2 z-50">
        <div className="relative ">
          <Input
            placeholder="Type your message here."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={streaming}
            className="py-8"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !streaming) {
                e.preventDefault(); // prevent newline
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={streaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
          >
            {streaming ? <Spinner /> : <CircleArrowOutUpRight />}
          </Button>
        </div>
      </div>
    </div>
  );
}
