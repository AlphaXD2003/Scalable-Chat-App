import db from "@/db/db";

interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export const messageService = {
  async addMessage(message: Message): Promise<void> {
    await db.messages.add(message);
  },

  async loadMessages(conversationId: string): Promise<Message[]> {
    const messages = await db.messages
      .where("conversationId")
      .equals(conversationId)
      .sortBy("timestamp");

    return messages;
  },
};
