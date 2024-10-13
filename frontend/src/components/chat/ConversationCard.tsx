import React, { memo, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
}

interface ConversationCardProps {
  conversation: Conversation;
  onSelect: (id: string, isUser: boolean) => void;
  selectedConversation: any;
  setSelectedConversation: any;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onSelect,
  selectedConversation,
  setSelectedConversation,
}) => {
  const { id, name, lastMessage, lastMessageTimestamp, unreadCount, avatar } =
    conversation;
  const [isUser, setIsUser] = useState<null | boolean>(null);

  const checkUserOrgroup = async () => {
    console.log("Conversation Id:", id);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkuserorgroup`,
        {
          name: id,
        },
        { withCredentials: true }
      );
      console.log({ id, data: response.data.data });
      setIsUser(response.data.data);
    } catch (error) {
      console.log("cerror", error);
    }
  };
  useEffect(() => {
    (async () => await checkUserOrgroup())();
  }, []);
  if (typeof isUser != "boolean") {
    return <Skeleton className="w-[100px] h-[20px] rounded-full" />;
  }
  if (isUser === null) {
    return <div>Loading...</div>; // Render a loading state while checking
  } else {
    return (
      <div
        className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${
          selectedConversation === id ? `bg-gray-700` : null
        }`}
        onClick={() => {
          onSelect(id, isUser);
          console.log("SelConvID", conversation);
          setSelectedConversation(conversation.id);
        }}
      >
        <img
          src={conversation.avatar}
          alt={name}
          className="w-12 h-12 rounded-full mr-3"
        />
        <div className="flex-grow">
          <h3 className="font-semibold text-white">
            {conversation.id.toUpperCase()}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {conversation.lastMessage}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(lastMessageTimestamp, { addSuffix: true })}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    );
  }
};
export default memo(ConversationCard);
