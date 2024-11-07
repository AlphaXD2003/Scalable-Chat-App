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

  useEffect(() => {
    if (user && user.username) {
      console.log("connecting socket");
      const socket = io(
        `${import.meta.env.VITE_SOCKET_URL}?username=${user.username}`
      );

      setSocket(socket);

      return () => {
        console.log("closing socket");
        socket.close();
        setSocket(null);
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
