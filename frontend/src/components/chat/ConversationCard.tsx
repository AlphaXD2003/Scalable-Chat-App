import React from "react";
import { formatDistanceToNow } from "date-fns";

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
  onSelect: (id: string) => void;
  selectedConversation: any;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onSelect,
  selectedConversation,
}) => {
  const { id, name, lastMessage, lastMessageTimestamp, unreadCount, avatar } =
    conversation;

  return (
    <div
      className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${
        selectedConversation === id ? `bg-gray-700` : null
      }`}
      onClick={() => onSelect(id)}
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
};

export default ConversationCard;
