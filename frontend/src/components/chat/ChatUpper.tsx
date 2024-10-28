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
import { useEffect, useState } from "react";
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

const ChatHeader = ({ conversationId }: Props) => {
  const [conversation, setConversation] = useState<Conversation | any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isuser, setIsUser] = useState<boolean>(false);
  const fetchConversation = async () => {
    try {
      const conv = await conversationService.getConversation(conversationId);
      console.log(conversationId);
      console.log(conv);
      if (conv) {
        setConversation(conv);
      }
    } catch (error) {}
  };

  const checkUserOrgroup = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkuserorgroup`,
        {
          name: conversationId,
        },
        { withCredentials: true }
      );
      setIsUser(response.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    (async () => {
      await fetchConversation();
      await checkUserOrgroup();
    })();
  }, [conversationId]);

  if (!conversation) {
    return <></>;
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      {/* Left side - Avatar and Name */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={conversation?.avatar || "/api/placeholder/40/40"}
            alt="User avatar"
          />
          <AvatarFallback className="bg-gray-700 text-gray-200">
            JD
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-sm text-gray-100">
            {conversationId.toUpperCase() || ""}
          </h2>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* Right side - Actions */}
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
                  isGroup={!isuser}
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
