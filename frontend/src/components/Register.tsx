import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import { ChangeEvent } from "react";
import axios from "axios";
interface LoginProps {
  [key: string]: any;
}
const Register = ({ ...props }: LoginProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firsname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const fileTypes = ["image/png", "image/jpg", "image/jpeg"];
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (selectedFile?.size >= maxSize) {
        return toast({
          title: "File is too large.",
        });
      }
      if (fileTypes.includes(selectedFile.type)) setFile(selectedFile);
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formadata = new FormData();
      formadata.append("username", username);
      formadata.append("password", password);
      formadata.append("firstname", password);
      formadata.append("lastname", lastname);
      formadata.append("email", email);
      if (file) {
        formadata.append("avatar", file);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/signup`,
        formadata,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      toast({
        title: "Successfully registered",
      });
    } catch (error) {
      toast({
        title: "Error while Registering the file",
      });
    }
  };

  return (
    <div
      className={`${props?.className} border-2 rounded-lg lg:p-10 flex flex-col justify-center `}
    >
      <Toaster />
      <form
        className="flex flex-col justify-center"
        action=""
        encType="multipart/form-data"
        onSubmit={async (e) => await handleSubmit(e)}
      >
        <div className="lg:w-[600px] lg:mb-4">
          <Input
            type="text"
            placeholder="Enter your First name.."
            value={firsname}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="lg:w-[600px] lg:mb-4">
          <Input
            type="text"
            placeholder="Enter your last name.."
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="lg:w-[600px] lg:mb-4">
          <Input
            type="text"
            placeholder="Enter your  username.."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="lg:w-[600px] lg:mb-4">
          <Input
            type="email"
            placeholder="Enter your  email.."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="lg:w-[600px] lg:mb-4">
          <Input
            type="text"
            placeholder="Enter your password.."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="lg:w-[600px] lg:mb-4 flex justify-between items-center mx-2 border p-2 cursor-pointer">
          <div className="cursor-default">Choose Your Avatar Image</div>

          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="ml-auto">
          <input
            type="submit"
            className="lg:w-[100px] lg:h-[50px]"
            value="Regsiter"
          />
        </div>
      </form>
    </div>
  );
};

export default Register;
