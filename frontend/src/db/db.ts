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

const db = new Dexie("ChatDatabase") as Dexie & {
  chats: EntityTable<Chat, "id">;
  groupchats: EntityTable<GroupChat, "id">;
};

db.version(1).stores({
  chats: "++id ,senderId, message, receiverId, timestamp",
  groupchats: "++id ,senderId, message, groupname, timestamp, type",
});

export default db;
