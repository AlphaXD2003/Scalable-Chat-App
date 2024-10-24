import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { FileUpload } from "@/components/ui/file-upload";
const CreateNewGroup = ({
  open,
  setOpen,
  toast,
}: {
  open: boolean;
  setOpen: any;
  toast: any;
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const [groupDesc, setGroupDesc] = useState<string>("");

  const handleGroupCreation = async () => {
    try {
      const formData = new FormData();
      formData.append("group_name", groupName);
      formData.append("description", groupDesc);
      if (file) {
        formData.append("group_avatar", file);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/create_group`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log(response.data.data);
    } catch (error) {
    } finally {
      setOpen(false);
    }
  };

  const [file, setFile] = useState<File | null>(null);
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      console.log(files[0]);
    }
  };

  if (open) {
    return (
      <Dialog open={open}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create new group and add users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupname" className="text-right">
                Group Name
              </Label>
              <Input
                id="groupname"
                placeholder="New Group"
                className="col-span-3"
                type="email"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">
                Group Description
              </Label>
              <Input
                id="desc"
                placeholder="Good Group"
                className="col-span-3"
                type="email"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
              />
            </div>
            {!file && (
              <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                <FileUpload onChange={handleFileUpload} />
              </div>
            )}
            <div>
              {file && (
                <div>
                  <img src={URL.createObjectURL(file)} alt="Group" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={async () => await handleGroupCreation()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } else {
    return <></>;
  }
};

export default CreateNewGroup;
