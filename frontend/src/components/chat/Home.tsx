import React, { useState, useEffect, useCallback } from "react";
import ConversationCard from "./ConversationCard";
import ChatArea from "./ChatArea";
import { useSocket } from "@/context/SocketContext";
import { messageService } from "@/services/messageService";
import { conversationService } from "@/services/conversationService";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import { useUserContext } from "@/context/UserContext";
import {
  MessageSquare,
  Send,
  Menu,
  Phone,
  Video,
  MoreVertical,
  Search,
  User,
  ChartAreaIcon,
  ChartBar,
  Cross,
  CrossIcon,
  DeleteIcon,
} from "lucide-react";
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
}

interface Message {
  id: string;
  text: string;
  sender: "self" | "other";
  timestamp: Date;
}

interface IncomingMessage {
  message: string;
  sender: string;
  type: string;
  uid: string;
  username: string;
}

interface IncomingGroupMessage {
  message: string;
  type: string;
  groupname: string;
  roomType: string;
  uid: string;
  sender: string;
}

const Home: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchContact, setSearchContact] = useState<string>("");
  // Socket
  const [socket] = useSocket();
  console.log(socket);

  const handleMessageReceive = async (data: IncomingMessage) => {
    await messageService.addMessage({
      conversationId: data.sender,
      id: data.uid,
      sender: data.sender,
      text: data.message,
      timestamp: new Date(),
    });
    if (selectedConversation === data.sender) {
      await loadMessages(data.sender);
    }
    const userDeatils = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
      {
        username: data.sender,
      },
      { withCredentials: true }
    );

    await conversationService.updateConversation(data.sender, {
      conversationId: data.sender,
      id: data.sender,
      sender: "other",
      text: data.message,
      timestamp: new Date(),
      avatar: userDeatils.data.data.avatar,
    });
    if (data.sender === selectedConversation) {
      await conversationService.updateUnReadMessage(data.sender);
    }
    await loadConverSationFromLocally();
  };
  const handleGroupMessageReceive = async (data: IncomingGroupMessage) => {
    await messageService.addMessage({
      conversationId: data.groupname,
      id: data.uid,
      sender: data.sender,
      text: data.message,
      timestamp: new Date(),
    });
    if (selectedConversation === data.groupname) {
      await loadMessages(data.groupname);
    }
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/group/group_details_name`,
      {
        name: data.groupname,
      },
      { withCredentials: true }
    );
    await conversationService.updateConversation(data.groupname, {
      conversationId: data.sender,
      id: data.groupname,
      sender: "other",
      text: data.message,
      timestamp: new Date(),
      avatar: response.data.data.avatar,
    });
    if (data.groupname === selectedConversation) {
      await conversationService.updateUnReadMessage(data.groupname);
    }
    await loadConverSationFromLocally();
  };

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", handleMessageReceive);
      socket.on("receive_group_message", handleGroupMessageReceive);
    }

    return () => {
      if (socket) {
        socket.off("receive_message", handleMessageReceive);
        socket.off("receive_group_message", handleGroupMessageReceive);
      }
    };
  }, [socket, handleMessageReceive, handleGroupMessageReceive]);

  const loadMessages = async (cid: string) => {
    try {
      const data = await messageService.loadMessages(cid);
      setMessages(data);
    } catch (error) {}
  };

  const handleSelectConversation = async (id: string) => {
    setSelectedConversation(id);
    await conversationService.updateUnReadMessage(id);
    await conversationService.loadConversations();
    await loadConverSationFromLocally();
    await loadMessages(id);
  };
  const { user } = useUserContext();

  const handleSendMessage = useCallback(
    async (text: string, cid: string) => {
      // Send message to API
      // This is a placeholder. Replace with actual API call.
      console.log("CID: ", cid);
      const newMessage: any = {
        id: Date.now().toString(),
        text,
        sender: user.username,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      await messageService.addMessage({
        ...newMessage,
        conversationId: cid,
      });
      socket?.emit("send_message", {
        username: cid,
        message: text,
      });
    },
    [socket]
  );
  const loadConverSationFromLocally = async () => {
    const data = await conversationService.loadConversations();
    console.log(data);
    setConversations(data);
  };
  useEffect(() => {
    (async () => {
      await loadConverSationFromLocally();
    })();
  }, []);
  if (!user) {
    return <Audio />;
  }
  return (
    <div
      className="flex h-screen bg-gray-900 text-white"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setSelectedConversation(null);
        }
      }}
      tabIndex={5}
    >
      <div className="w-1/3 bg-gray-800 border-r overflow-y-auto">
        <div className="bg-gray-900 p-4 flex justify-between items-center ">
          <img src={user?.avatar} className="w-10 h-10 rounded-full" />
          <div className="flex space-x-4">
            <MessageSquare size={24} className="text-gray-300 cursor-pointer" />
            <MoreVertical size={24} className="text-gray-300 cursor-pointer" />
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              className="w-full  bg-gray-700 text-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
              size={20}
            />
            <DeleteIcon
              className="absolute cursor-pointer right-3 top-2.5 text-gray-400 "
              size={20}
              onClick={(e) => setSearchContact("")}
            />
          </div>
        </div>
        {!searchContact &&
          conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onSelect={() => handleSelectConversation(conversation.id)}
              selectedConversation={selectedConversation}
            />
          ))}
        {searchContact &&
          conversations
            .filter((conversation) =>
              conversation.id
                .toLowerCase()
                .includes(searchContact.toLowerCase())
            )
            .map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onSelect={() => handleSelectConversation(conversation.id)}
                selectedConversation={selectedConversation}
              />
            ))}
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatArea
            conversationId={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 gap-4">
            <ChartBar />
            Select a chat to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
