import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import axios from "axios";
import { Stream } from "stream";
interface Props {
  children?: React.ReactNode;
}
interface PeerContextType {
  peer: RTCPeerConnection | null;
  incomingCall: boolean;
  setIncomingCall: React.Dispatch<React.SetStateAction<boolean>>;
  callerName: string;
  avatar: string;
  createCall: any;
  createAnswer: any;
  sendStream: any;
  type: any;
  setType: any;
  remoteStream: any;
  setRemoteStream: any;
  localStream: any;
  setLocalStream: any;
}

const PeerContext = React.createContext<PeerContextType | null>(null);

export const usePeerContext = () => {
  const context = React.useContext(PeerContext);
  if (!context) {
    throw new Error("usePeerContext must be used within a PeerProvider");
  }
  return context;
};
const PeerProvider = (props: Props) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  });
  const [socket] = useSocket();
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [callerName, setCallerName] = useState<string>("");
  const handleIncomingCall = async (data: any) => {
    console.log(data);
    setIncomingCall(true);
    setCallerName(data.from);
  };

  const [avatar, setAvatar] = useState<string>("");
  const handleCallerName = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
        {
          username: callerName,
        },
        { withCredentials: true }
      );
      setAvatar(response.data.data.avatar);
    } catch (error) {}
  }, [callerName]);

  const createCall = async (to: string) => {
    const offer = await peer.createOffer();
    await peer?.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  };

  const createAnswer = async (offer: any) => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const ans = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(ans));

    return ans;
  };

  const sendStream = useCallback(async (stream: any) => {
    try {
      console.log(stream);
      const tracks = stream.getTracks();
      console.log(tracks);

      if (tracks.length === 0) {
        console.error("No tracks available in the stream");
        return;
      }

      if (!peer) {
        console.error("Peer object is not available");
        return;
      }

      for (const track of tracks) {
        peer.addTrack(track, stream);
      }
    } catch (error) {
      console.error("Error sending stream:", error);
    }
  }, []);

  const [type, setType] = useState<"audio" | "video">("audio");

  useEffect(() => {
    if (callerName) {
      (async () => await handleCallerName())();
    }
  }, [callerName]);
  useEffect(() => {
    socket?.on("incomming:call", handleIncomingCall);

    return () => {
      socket?.off("incomming:call", handleIncomingCall);
    };
  }, [socket]);
  useEffect(() => {}, []);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const handleTrack = (event: any) => {
    console.log(event);
    const stream = event.streams;
    console.log("peer on event");
    console.log(stream);
  };
  useEffect(() => {
    if (peer) {
      peer.addEventListener("track", handleTrack);
      return () => {
        peer.removeEventListener("track", handleTrack);
      };
    }
  }, [peer]);
  return (
    <PeerContext.Provider
      value={{
        localStream,
        setLocalStream,
        setRemoteStream,
        remoteStream,
        type,
        setType,
        peer,
        incomingCall,
        setIncomingCall,
        callerName,
        avatar,
        createCall,
        createAnswer,
        sendStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
