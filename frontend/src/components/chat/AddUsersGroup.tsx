import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlockList } from "net";
import axios from "axios";
import { useUserContext } from "@/context/UserContext";
interface Props {
  open: boolean;
  setOpen: any;
  conversationId: string;
  findUsersOfGroup: any;
}
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
const AddMembersDialog = ({
  findUsersOfGroup,
  open,
  setOpen,
  conversationId,
}: Props) => {
  const { user } = useUserContext();
  const [users, setUsers] = useState<User[]>([]);
  console.log(conversationId);
  const fetchGroupMembers = async () => {
    try {
      console.log(conversationId);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/users_group`,
        {
          groupname: conversationId,
        },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return [];
    }
  };
  const fetchContactUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/contact`,
        {
          id: user.id,
        },
        { withCredentials: true }
      );
      console.log(response.data.data);
      const userdata: User[] = [];
      for (const email of response.data.data) {
        const othersemail = email.savedEmail;
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/emaildetails`,
          {
            email: othersemail,
          },
          { withCredentials: true }
        );
        const data = response.data.data;

        userdata.push({
          avatar: data.avatar,
          id: data._id,
          email: data.email,
          name: data.username,
        });
      }
      const gmemebers: any = await fetchGroupMembers();
      const agmemberid = gmemebers.map((gm: any) => gm.id);
      console.log(agmemberid);
      console.log(userdata);
      console.log(
        userdata.filter((user) => {
          return !agmemberid.includes(user.id);
        })
      );
      setUsers(() => {
        return userdata.filter((user) => {
          return !agmemberid.includes(user.id);
        });
      });
    } catch (error) {}
  };

  useEffect(() => {
    (async () => {
      await fetchContactUser();
    })();
  }, []);
  // Sample users data - replace with your actual data

  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const toggleUser = (userId: any) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleAddMembers = async () => {
    console.log("Selected users:", Array.from(selectedUsers));
    // Add your logic to handle adding members
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/add`,
        {
          adduserids: Array.from(selectedUsers),
          gname: conversationId,
        },
        { withCredentials: true }
      );
      console.log(response.data.data);
    } catch (error) {
    } finally {
      setOpen(false);
      await findUsersOfGroup();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4 ">
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center text-gray-200 focus:bg-gray-800  space-x-4 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.has(user.id)}
                  onCheckedChange={() => toggleUser(user.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button onClick={handleAddMembers}>
            Add Selected ({selectedUsers.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMembersDialog;
