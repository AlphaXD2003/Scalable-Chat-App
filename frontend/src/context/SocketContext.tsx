import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUserContext } from "./UserContext";
import db from "@/db/db";

interface SocketContextType {
  socket: Socket | null;
}
interface ReceivedMessage {
  message: string;
  sender: string;
  type: string;
  uid: string;
  username: string;
}
interface OfflineReceivedMessage {
  username?: string;
  receiver?: string;
  message: string;
  type: string;
  sender: string;
  time: any;
}

interface GroupChats {
  groupname: string;
  message: string;
  sender: string;
  type: string;
}

interface OfflineGroupChats {
  message: string;
  type: string;
  groupname: string;
  sender: string;
  time: any;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  const { socket } = context;
  return [socket] as const;
};

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserContext();

  const receive_message = async (data: ReceivedMessage) => {
    console.log("Received Data: ", data);
    await db.chats.add({
      message: data.message,
      receiverId: data.username,
      senderId: data.sender,
      timestamp: Date.now(),
    });
  };
  const offline_message = async (data: OfflineReceivedMessage[]) => {
    if (user && user.username) {
      console.log("Offline Message Data: ", data);

      for (const msg of data) {
        await db.chats.add({
          senderId: msg.sender,
          message: msg.message,
          receiverId: msg?.username || msg?.receiver || user.username,
          timestamp: Date.now(),
        });
      }
    }
  };
  const group_message = async (data: GroupChats) => {
    console.log("Group Message Data: ", data);
    await db.groupchats.add({
      groupname: data.groupname,
      message: data.message,
      senderId: data.sender,
      type: "receive",
      timestamp: Date.now(),
    });
  };
  const offline_group_message = (data: OfflineGroupChats[]) => {
    console.log("Offline Group Message: ", data);

    data.forEach(async (msg) => {
      await db.groupchats.add({
        groupname: msg.groupname,
        message: msg.message,
        senderId: msg.sender,
        type: msg.type,
        timestamp: Date.now(),
      });
    });
  };
  const err_message = ({ error_message }: { error_message: string }) => {
    console.log("Received Error Message: ", error_message);
  };

  useEffect(() => {
    if (user && user.username) {
      console.log("connecting socket");
      const socket = io(
        `${import.meta.env.VITE_SOCKET_URL}?username=${user.username}`
      );

      setSocket(socket);

      // socket.on("receive_message", receive_message);

      // socket.on("message:offline", offline_message);

      // socket.on("receive_group_message", group_message);

      // socket.on("groupmessage:offline", offline_group_message);

      // socket.on("error_msg", err_message);

      return () => {
        console.log("closing socket");
        socket.close();
        setSocket(null);

        // socket.off("receive_message", receive_message);

        // socket.off("message:offline", offline_message);

        // socket.off("receive_group_message", group_message);

        // socket.off("groupmessage:offline", offline_group_message);

        // socket.off("error_msg", err_message);
      };
    }
  }, [user?.username]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {" "}
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
