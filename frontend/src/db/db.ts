import Dexie, { type EntityTable } from "dexie";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
  username?: string;
  messageId: string;
}

interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: string;
  timestamp: Date;
}

const db = new Dexie("ChatDatabase") as Dexie & {
  conversations: EntityTable<Conversation, "id">;
  messages: EntityTable<Message, "id">;
};

db.version(1).stores({
  conversations:
    "id ,name, lastMessage, lastMessageTimestamp, unreadCount, avatar",
  messages: "id ,conversationId, text, sender, timeStamp",
});

export default db;
