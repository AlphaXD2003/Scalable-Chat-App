import db from "@/db/db";
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
  user?: string;
}

interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: "self" | "other";
  timestamp: Date;
  user?: string;
  avatar?: string;
}

export const conversationService = {
  async loadConversations(): Promise<Conversation[]> {
    const conversations = await db.conversations.toArray();

    return conversations.sort(
      (a, b) =>
        b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()
    );
  },

  async updateConversation(
    conversationId: string,
    message: Message
  ): Promise<void> {
    const conversation = await db.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessage = message.text;
      conversation.lastMessageTimestamp = message.timestamp;
      conversation.unreadCount += 1;
      await db.conversations.put(conversation);
    } else {
      await db.conversations.add({
        avatar: message.avatar || "",
        lastMessage: message.text,
        unreadCount: 1,
        name: message.sender,
        id: message.id,
        lastMessageTimestamp: message.timestamp,
      });
    }
  },

  async updateUnReadMessage(conversationId: string): Promise<void> {
    const conversation = await db.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      await db.conversations.put(conversation);
    }
  },
};
