import db from "@/db/db";
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
  user?: string;
  messageId: string;
}

interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: "self" | "other";
  timestamp: Date;
  user?: string;
  avatar?: string;
  messageId: string;
}

export const conversationService = {
  async loadConversations(): Promise<Conversation[]> {
    const conversations = await db.conversations.toArray();

    return conversations
      .map((conversation) => ({
        ...conversation,
        lastMessageTimestamp: new Date(conversation.lastMessageTimestamp),
      }))
      .sort(
        (a, b) =>
          b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()
      );
  },

  async updateConversation(
    conversationId: string,
    message: Message
  ): Promise<void> {
    console.log("message", message);
    const conversation = await db.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessage = message.text;
      conversation.lastMessageTimestamp = new Date(message.timestamp);
      conversation.unreadCount += 1;
      conversation.messageId = message.messageId;

      await db.conversations.put(conversation);
    } else {
      await db.conversations.add({
        avatar: message.avatar || "",
        lastMessage: message.text,
        unreadCount: 1,
        name: message.sender,
        id: message.id,
        lastMessageTimestamp: message.timestamp,
        messageId: message.messageId,
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
  async updateLastMessage(
    conversationId: string,
    message: string
  ): Promise<void> {
    const conversation = await db.conversations.get(conversationId);
    console.log(conversation);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastMessageTimestamp = new Date();
      await db.conversations.put(conversation);
    }
  },
  async getConversation(cid: string): Promise<Conversation | undefined> {
    const conversation = await db.conversations.get(cid);
    return conversation;
  },
  async getConversationFromMid(mid: string): Promise<Conversation | undefined> {
    const message = await db.messages.get(mid);
    if (!message) {
      console.error(`Message with ID ${mid} not found`);
      return;
    }
    const conversationId = message.conversationId;
    const conversation = await db.conversations.get(conversationId);
    if (!conversation) {
      console.error(`Conversation with ID ${conversationId} not found`);
      return;
    }
    console.log(conversation);
    return conversation;
  },
};
