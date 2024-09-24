import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUserContext } from "./UserContext";

interface SocketContextType {
  socket: Socket | null;
}
const SocketContext = createContext<SocketContextType | null>(null);

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserContext();
  useEffect(() => {
    if (user && user.username) {
      const socket = io(
        `${import.meta.env.VITE_SOCKET_URL}?username=${user.username}`
      );

      setSocket(socket);
      return () => {
        socket.close();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {" "}
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
