import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { conversationService } from "@/services/conversationService";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChatInfoView from "./ViewContact";
import { DialogDescription } from "@radix-ui/react-dialog";
import axios from "axios";

interface Props {
  conversationId: string;
}

interface Conversation {
  conversationId: string;
  avatar: string;
}

interface UserStatus {
  status: string | null;
  error: string | null;
  loading: boolean;
}

const ChatHeader = ({ conversationId }: Props) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<UserStatus>({
    status: null,
    error: null,
    loading: false,
  });

  // Use ref to track if a status fetch is in progress
  const isFetchingStatus = useRef(false);
  // Use ref to store the interval ID
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversation = async () => {
    try {
      const conv = await conversationService.getConversation(conversationId);
      if (conv) {
        setConversation(conv);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  const fetchUserStatus = async () => {
    // If already fetching, skip this request
    if (isFetchingStatus.current) return;

    isFetchingStatus.current = true;
    setUserStatus((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/status`,
        { username: conversationId },
        { withCredentials: true }
      );

      setUserStatus({
        status: response.data.data,
        error: null,
        loading: false,
      });
    } catch (error) {
      setUserStatus((prev) => ({
        ...prev,
        error: "Failed to fetch user status",
        loading: false,
      }));
    } finally {
      isFetchingStatus.current = false;
    }
  };

  const checkUserOrGroup = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkuserorgroup`,
        { name: conversationId },
        { withCredentials: true }
      );
      setIsUser(response.data.data);
    } catch (error) {
      console.error("Failed to check user/group status:", error);
    }
  };

  // Setup initial data
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchConversation(), checkUserOrGroup()]);
    };

    initialize();

    // Cleanup function
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [conversationId]);

  // Setup status polling for users only
  useEffect(() => {
    if (isUser) {
      // Fetch initial status
      fetchUserStatus();

      // Setup interval for subsequent fetches
      statusIntervalRef.current = setInterval(fetchUserStatus, 15000);

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      };
    }
  }, [conversationId, isUser]);

  const formatStatus = (status: string | null) => {
    if (!status) return "";
    return isNaN(Number(status))
      ? status.toUpperCase()
      : new Date(Number(status)).toLocaleString();
  };
  if (!conversation) {
    return <></>;
  }
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={conversation?.avatar || "/api/placeholder/40/40"}
            alt="User avatar"
          />
          <AvatarFallback className="bg-gray-700 text-gray-200">
            {conversationId.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-sm text-gray-100">
            {conversationId.toUpperCase()}
          </h2>
          <p className="text-xs text-gray-400">
            {userStatus.loading
              ? "Loading..."
              : formatStatus(userStatus.status)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-gray-800"
        >
          <Video className="h-5 w-5 text-gray-300" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-gray-800"
        >
          <Phone className="h-5 w-5 text-gray-300" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-gray-800"
            >
              <MoreVertical className="h-5 w-5 text-gray-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDialogOpen(true);
                  }}
                  className="text-gray-200 focus:bg-gray-800 focus:text-gray-100"
                >
                  View Contact
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0 bg-gray-900 border-gray-800">
                <DialogTitle className="sr-only">
                  Contact Information
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View contact details and settings
                </DialogDescription>
                <ChatInfoView
                  conversation={conversation}
                  isGroup={!isUser}
                  image={conversation.avatar}
                />
              </DialogContent>
            </Dialog>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-800 focus:text-gray-100">
              Media, links, and docs
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-800 focus:text-gray-100">
              Search
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-800 focus:text-gray-100">
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 focus:bg-gray-800 focus:text-red-300">
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
