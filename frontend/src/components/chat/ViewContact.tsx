import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Image,
  Link2,
  Lock,
  MessageSquare,
  Phone,
  Search,
  Star,
  Trash2,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import axios from "axios";
import AddMembersDialog from "./AddUsersGroup";

interface Conversation {
  id: string;
  email?: string;
}

interface ChatInfoViewProps {
  isGroup?: boolean;
  image?: string;
  conversation: Conversation;
}
interface User {
  id: string;
  status: string;
  avatar: string;
  email: string;
  username: string;
}

const ChatInfoView = ({
  isGroup = false,
  image = "/api/placeholder/40/40",
  conversation,
}: ChatInfoViewProps) => {
  const [muted, setMuted] = useState(false);
  console.log(conversation);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>({
    id: "",
    status: "",
    avatar: "",
    email: "",
    username: conversation.id,
  });
  const [addPartOpen, setAddPartOpen] = useState<boolean>(false);
  const findgroupDetails = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/group_details_name`,
        {
          name: conversation.id,
        },
        { withCredentials: true }
      );
      console.log(res.data.data);
    } catch (error) {}
  };
  const findUsersOfGroup = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/users_group`,
        {
          groupname: conversation.id,
        },
        { withCredentials: true }
      );
      console.log(res.data.data);
      setUsers(res.data.data);
    } catch (error) {}
  };

  const findUserInfo = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
        {
          username: conversation.id,
        },
        {
          withCredentials: true,
        }
      );
      setUser(response.data.data);
      console.log(response.data.data);
    } catch (error) {}
  };
  useEffect(() => {
    if (isGroup) {
      (async () => {
        await findgroupDetails();
        await findUsersOfGroup();
      })();
    } else {
      (async () => {
        await findUserInfo();
      })();
    }
  }, [conversation]);

  if (!(users || user) || !conversation) {
    return <></>;
  }
  return (
    <div className="flex flex-col h-[80vh] bg-gray-900">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={image || "/api/placeholder/128/128"}
                alt="Profile"
              />
              <AvatarFallback className="bg-gray-700 text-gray-200 text-4xl">
                {isGroup ? "G" : "JD"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-100">
                {conversation.id.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-400">
                {isGroup ? `Group • ${users.length} participants` : user.email}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-gray-300 hover:bg-gray-800"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">Message</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-gray-300 hover:bg-gray-800"
            >
              <Video className="h-6 w-6" />
              <span className="text-xs">Video</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-gray-300 hover:bg-gray-800"
            >
              <Phone className="h-6 w-6" />
              <span className="text-xs">Voice</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-1 text-gray-300 hover:bg-gray-800"
            >
              <Search className="h-6 w-6" />
              <span className="text-xs">Search</span>
            </Button>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* Mute Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="text-gray-200">Mute notifications</span>
              </div>
              <Switch checked={muted} onCheckedChange={setMuted} />
            </div>

            {/* Media Links Docs */}
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="h-5 w-5 text-gray-300" />
                  <span className="text-gray-200">Media, links, and docs</span>
                </div>
                <span className="text-gray-400">127 ›</span>
              </div>
            </div>

            {isGroup && (
              <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-gray-200 font-medium">
                    {users.length} participants
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setAddPartOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add participant
                  </Button>
                </div>
                <AddMembersDialog
                  conversationId={conversation.id}
                  open={addPartOpen}
                  setOpen={setAddPartOpen}
                  findUsersOfGroup={findUsersOfGroup}
                />

                {/* Participants List */}
                <div className="space-y-4">
                  {users.length > 0 &&
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-gray-700 text-gray-200">
                            {user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-gray-200">{user.username}</p>
                          <p className="text-sm text-gray-400">
                            {user.status || "Online"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Star className="h-5 w-5 mr-3" />
                Starred messages
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Lock className="h-5 w-5 mr-3" />
                Encryption
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-gray-800"
              >
                <Trash2 className="h-5 w-5 mr-3" />
                {isGroup ? "Exit group" : "Block contact"}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
export default ChatInfoView;
