import React, { KeyboardEvent, ReactEventHandler, useState } from "react";
import { format } from "date-fns";
import { useUserContext } from "@/context/UserContext";

interface Message {
  id: string;
  text: string;
  sender: "self" | "other";
  timestamp: Date;
}

interface ChatAreaProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (text: string, cid: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, conversationId);
      setInputText("");
    }
  };
  const { user } = useUserContext();
  console.log(`Username: `, user.username);
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSend();
        }
      }}
      className="flex flex-col h-full"
    >
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <div>
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  message.sender === user.username
                    ? "bg-green-500 text-white"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`text-xs ${
                    message.sender === user.username
                      ? "text-gray-900"
                      : "text-neutral-400"
                  }`}
                >
                  {message.sender}
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
    </div>
  );
};

export default ChatArea;
