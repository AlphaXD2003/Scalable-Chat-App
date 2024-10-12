import React, { useEffect, useRef, useState } from "react";
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

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface ChatAreaProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (text: string, cid: string, isUser: boolean) => void;
  setMessages: any;
  loadConverSationFromLocally: any;
  emitDeleteMessage: any;
  sendDelete: any;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  messages,
  onSendMessage,
  setMessages,
  loadConverSationFromLocally,
  emitDeleteMessage,
  sendDelete,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, conversationId, isUser);
      setInputText("");
    }
  };
  const { user } = useUserContext();
  console.log(`Username: `, user.username);
  const [isUser, setIsUser] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    (async () => {
      try {
        await checkUserOrgroup();
        scrollToBottom();
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
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
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
                  {format(message.timestamp, "HH:mm")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatArea;
