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
import { useCallback, useState } from "react";
import axios from "axios";
import { useUserContext } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

const CreateNewContact = ({
  open,
  setOpen,
  toast,
}: {
  open: boolean;
  setOpen: any;
  toast: any;
}) => {
  const [email, setEmail] = useState<string>("");
  const { user } = useUserContext();

  const handleCreateNewContact = async () => {
    try {
      console.log(user.email);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/save`,
        {
          others_email: email,
          user_email: user.email,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response.data.data);

      toast({
        title: "Contact Saved",
      });
    } catch (error) {
      toast({
        title: "Contact is not Saved",
      });
    } finally {
      setOpen(false);
      setEmail("");
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
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>Create new contact.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="useremail" className="text-right">
                User Email
              </Label>
              <Input
                id="useremail"
                placeholder="how2mc@gmail.com"
                className="col-span-3"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                await handleCreateNewContact();
              }}
            >
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

export default CreateNewContact;
