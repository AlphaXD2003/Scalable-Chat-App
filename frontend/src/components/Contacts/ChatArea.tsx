import React, { ChangeEvent, ReactEventHandler, useState } from "react";
import {
  Send,
  Menu,
  Phone,
  Video,
  Search,
  MoreVertical,
  SendIcon,
  KeyboardIcon,
} from "lucide-react";

import db from "@/db/db";
import { useSocket } from "@/context/SocketContext";
import { Socket } from "socket.io-client";
import { useUserContext } from "@/context/UserContext";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface User {
  avatar: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  _id: string;
}

const ChatArea = ({ contact }: { contact: User | null }) => {
  const [socket] = useSocket() as [Socket];
  const [message, setMessage] = useState<string>("");
  const { user } = useUserContext();
  const { toast } = useToast();
  const handleSendMessage = async () => {
    if (message.length > 0 && user.username && contact && contact.username) {
      socket.emit("send_message", {
        username: contact?.username,
        message,
        type: "text",
      });
      await db.chats.add({
        senderId: user.username,
        receiverId: contact?.username,
        message,
        timestamp: Date.now(),
      });
      setMessage("");
    } else {
      toast({
        title: "Error while sending the message.",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <Toaster />
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex gap-3">
            <img src={contact?.avatar} className="w-10 h-10 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="capitalize">{`${contact?.firstname} ${contact?.lastname} `}</div>
            <div className="text-gray-500"> ({contact?.email})</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-300">
          <Phone className="cursor-pointer" size={20} />
          <Video className="cursor-pointer" size={20} />
          <Search className="cursor-pointer" size={20} />
          <MoreVertical className="cursor-pointer" size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4"></div>
      <div className="p-4">
        <div className="relative">
          <KeyboardIcon
            className="absolute left-3 top-2.5 text-gray-400"
            size={20}
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="Type a message to send..."
            className="w-full  bg-gray-700 text-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
          />
          <SendIcon
            className="absolute cursor-pointer right-3 top-2.5 text-gray-400"
            size={20}
            onClick={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
