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
};
