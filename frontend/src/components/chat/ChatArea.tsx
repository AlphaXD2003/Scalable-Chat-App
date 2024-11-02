import React, { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

import { messageService } from "@/services/messageService";
import { conversationService } from "@/services/conversationService";
import ChatHeader from "./ChatUpper";
import { Button } from "../ui/button";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface ChatAreaProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (text: string, cid: string) => void;
  setMessages: any;
  loadConverSationFromLocally: any;
  emitDeleteMessage: any;
  sendDelete: any;
  loadMessages: any;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  messages,
  onSendMessage,
  setMessages,
  loadConverSationFromLocally,
  emitDeleteMessage,
  sendDelete,
  loadMessages,
}) => {
  const [inputText, setInputText] = useState("");

  const [limit, setLimit] = useState<number>(20);
  const [offSet, setOffSet] = useState<number>(0);
  const [total, setTotal] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const onHandleLoadOlderMessages = async () => {
    setShowScrollButton(true);
    if (isLoading || total <= messages.length) {
      console.log("p");
      return;
    }
    try {
      setIsLoading(true);
      const newOffSet = offSet + limit;

      const data = await messageService.getMessages(
        newOffSet,
        20,
        conversationId
      );
      console.log(data);
      if (data.length > 0) {
        const transformedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: new Date(msg?.timestamp),
        }));

        setMessages((prev: Message[]) => [...transformedMessages, ...prev]);

        setOffSet(newOffSet);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxMessages = async () => {
    try {
      const response = await messageService.getTotalMessageCount(
        conversationId
      );
      setTotal(response);
    } catch (error) {}
  };

  useEffect(() => {
    setOffSet(0);
    (async () => {
      await getMaxMessages();
    })();

    return () => {
      setOffSet(0);
      setTotal(20);
    };
  }, [conversationId]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, conversationId);
      setInputText("");
    }
  };
  const { user } = useUserContext();
  console.log(`Username: `, user.username);
  const [isUser, setIsUser] = useState<boolean>(false);

  const checkUserOrgroup = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkuserorgroup`,
        {
          name: conversationId,
        },
        { withCredentials: true }
      );
      setIsUser(response.data.data);
    } catch (error) {}
  };

  const [activeDeleteMessage, setActiveDeleteMessage] =
    useState<Message | null>(null);

  const handleDeleteForMe = async () => {
    try {
      if (activeDeleteMessage?.id) {
        const response = await messageService.deleteMessage(
          activeDeleteMessage.id
        );
        console.log(response);

        setMessages((prevMessages: Message[]) => {
          return prevMessages.map((message) => {
            if (message.id === activeDeleteMessage.id) {
              return { ...message, text: "This message was deleted" };
            }
            return message;
          });
        });
        const conversation = await conversationService.getConversation(
          conversationId
        );
        console.log("CID", conversation);
        await emitDeleteMessage(activeDeleteMessage.id, conversationId);

        if (
          conversation?.lastMessageTimestamp &&
          new Date(activeDeleteMessage.timestamp).getTime() -
            new Date(conversation?.lastMessageTimestamp).getTime() <=
            200
        ) {
          await conversationService.updateLastMessage(
            conversationId,
            "This message was deleted"
          );
        }
        await loadConverSationFromLocally();
        setActiveDeleteMessage(null);
      }
    } catch (error) {
      setActiveDeleteMessage(null);
      console.error("Error deleting message:", error);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  useEffect(() => {
    console.log(conversationId);
    (async () => {
      try {
        await checkUserOrgroup();
      } catch (error) {
        console.error("Error checking user or group:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeDeleteMessage) {
      (async () => {
        await handleDeleteForMe();
      })();
    }
  }, [activeDeleteMessage]);
  if (typeof isUser != "boolean") {
    return <Skeleton className="w-[100px] h-[20px] rounded-full" />;
  }

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSend();
        }
      }}
      className="flex flex-col h-full "
    >
      <div>
        <ChatHeader conversationId={conversationId} />
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4 ">
        <div className="absolute flex w-full opacity-40 text-white">
          <Button
            className="mx-auto"
            color="white"
            onClick={async () => {
              await onHandleLoadOlderMessages();
            }}
          >
            Load More
          </Button>
        </div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <div className="">
              <div
                className={`max-w-xs rounded-lg p-3 lg:min-w-[200px] ${
                  message.sender === user.username
                    ? "bg-green-500 text-white"
                    : "bg-gray-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div
                    className={`text-xs ${
                      message.sender === user.username
                        ? "text-gray-900"
                        : "text-neutral-400"
                    }`}
                  >
                    {message.sender}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <ChevronDownIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 cursor-pointer">
                      <DropdownMenuItem className="cursor-pointer">
                        Edit
                      </DropdownMenuItem>
                      {message.sender === user.username ? (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={async () => {
                            // setDeleteDialogOpen((prev) => !prev);
                            setActiveDeleteMessage(message);
                            sendDelete(
                              message.id,
                              user.username,
                              conversationId
                            );
                            // await handleDeleteForMe();
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="cursor-pointer">
                        Forward
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p>{message.text}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                  {format(message?.timestamp, "HH:mm")}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <div
          onClick={scrollToBottom}
          className="flex gap-2 mx-auto cursor-pointer"
        >
          <button className="scroll-to-bottom-button">Scroll to Bottom</button>
          <ChevronDownIcon />
        </div>
      )}
      <div className="border-t p-4 flex">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-grow border bg-gray-600 rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-gray-00"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white rounded-full px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Send
        </button>
      </div>
      <div />
    </div>
  );
};

export default ChatArea;
