import { usePeerContext } from "@/context/PeerContext";
import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import { ResizableBox } from "react-resizable";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  muted: boolean;
  playing: boolean;
}
const CallPopup = ({ isOpen, onClose, muted, playing }: Props) => {
  const { localStream, remoteStream, peer, type, setRemoteStream } =
    usePeerContext();
  const handleTrack = (event: any) => {
    console.log("hello");
    const streams = event.streams;
    setRemoteStream(streams[0]);
  };
  useEffect(() => {
    peer?.addEventListener("track", handleTrack);
    return () => {
      peer?.removeEventListener("track", handleTrack);
    };
  }, [peer]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <ResizableBox
        width={600}
        height={400}
        minConstraints={[300, 200]}
        maxConstraints={[800, 600]}
        className="bg-white rounded-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1"
        >
          Close
        </button>
        <div className="flex">
          <div className="w-1/2 p-2">
            <h2 className="text-lg font-bold mb-2">Your Video</h2>
            <ReactPlayer
              url={localStream}
              muted={muted}
              playing={playing}
              width="100%"
              height="100%"
            />
          </div>
          <div className="w-1/2 p-2">
            <h2 className="text-lg font-bold mb-2">Other's Video</h2>
            <ReactPlayer
              url={remoteStream}
              muted={muted}
              playing={playing}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </ResizableBox>
    </div>
  );
};

export default CallPopup;
