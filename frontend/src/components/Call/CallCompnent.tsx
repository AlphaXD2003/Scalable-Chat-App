import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, User, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { usePeerContext } from "@/context/PeerContext";
import { useSocket } from "@/context/SocketContext";
import { useUserContext } from "@/context/UserContext";

const IncomingCallNotification = ({
  muted = false,
  setCallGranted,
  callerImage = "/api/placeholder/40/40",
  onAccept = () => {},
  onDecline = () => {},
  setIncomingCall,
  ringtonePath = "/ringtone.mp3",
}: any) => {
  const [isMuted, setIsMuted] = React.useState(muted);
  const audioRef = useRef(new Audio(ringtonePath));
  const [socket] = useSocket();
  console.log(audioRef);
  useEffect(() => {
    // Configure audio
    audioRef.current.loop = true;

    // Start playing when component mounts
    if (!isMuted) {
      audioRef.current
        .play()
        .then(() => console.log("playing"))
        .catch((error) => {
          console.log("Audio playback failed:", error);
        });
    }

    // Cleanup on component unmount
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    }
  }, [isMuted]);
  const { user } = useUserContext();
  const handleAccept = () => {
    audioRef.current.pause();
    onAccept({ callerName, avatar });
    socket?.emit("call:accepted", {
      calledId: user.username,
      callerId: callerName,
    });
    setIncomingCall(false);
  };

  const handleDecline = () => {
    audioRef.current.pause();
    onDecline();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const { callerName, avatar } = usePeerContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <Card className="w-80 p-4 bg-white shadow-lg border-2">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar || callerImage} alt={callerName} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Incoming Call</p>
            <p className="text-sm text-gray-500 truncate">
              {callerName?.toUpperCase()}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDecline}
            className="flex items-center"
          >
            <PhoneOff className="h-4 w-4 mr-2" onClick={onDecline} />
            Decline
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAccept}
            className="flex items-center bg-green-600 hover:bg-green-700"
          >
            <Phone className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Add slide-up animation
const styles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

export default IncomingCallNotification;
