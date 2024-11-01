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
  async deleteMessage(messageId: string | undefined): Promise<boolean> {
    let response;
    console.log(messageId);
    if (messageId) {
      response = await db.messages.get(messageId);
      if (response) {
        response.text = "This Message was deleted";
        await db.messages.put(response);
        return true;
      }
      return false;
    }
    return false;
  },
  async getTotalMessageCount(conversationId: string): Promise<number> {
    let response;
    if (conversationId) {
      response = await db.messages
        .where("conversationId")
        .equals(conversationId)
        .count();
      return response;
    } else {
      return 0;
    }
  },

  async getMessages(
    offset = 0,
    limit = 20,
    conversationId: string
  ): Promise<Message[]> {
    let response;
    if (conversationId) {
      response = await db.messages
        .where("conversationId")
        .equals(conversationId)
        .sortBy("timestamp"); // Sort by timestamp first
      // .then((messages) => messages.reverse()) // Then reverse to get most recent first
      // .then((messages) => messages.slice(offset, offset + limit)); // Apply offset and limit

      return response.slice(-limit - offset, -offset || undefined);
    } else {
      return [];
    }
  },
};
