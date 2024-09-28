import Dexie, { type EntityTable } from "dexie";

interface Chat {
  id: number;
  senderId: string;
  message: string;
  receiverId: string;
  timestamp: any;
}
interface GroupChat {
  id: number;
  senderId: string;
  message: string;
  groupname: string;
  timestamp: any;
  type: string | "send" | "receive";
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
  username?: string;
}

interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: string;
  timestamp: Date;
}

const db = new Dexie("ChatDatabase") as Dexie & {
  chats: EntityTable<Chat, "id">;
  groupchats: EntityTable<GroupChat, "id">;
  conversations: EntityTable<Conversation, "id">;
  messages: EntityTable<Message, "id">;
};

db.version(1).stores({
  chats: "++id ,senderId, message, receiverId, timestamp",
  groupchats: "++id ,senderId, message, groupname, timestamp, type",
  conversations:
    "id ,name, lastMessage, lastMessageTimestamp, unreadCount, avatar",
  messages: "id ,conversationId, text, sender, timeStamp",
});

export default db;
