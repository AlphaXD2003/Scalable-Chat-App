import { FormEvent, useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
interface LoginProps {
  [key: string]: any;
}
const Register = ({ ...props }: LoginProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstname, setFirstName] = useState<string>("");
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
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <Toaster />
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Register at InChat
      </h2>
      <div className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Already have and account?{" "}
        <Link className="text-blue-600" to="/login">
          Login
        </Link>
      </div>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
              id="firstname"
              placeholder="Enter First name"
              type="text"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
              id="lastname"
              placeholder="Enter Last name"
              type="text"
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter User name"
            type="text"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            type="email"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="avatar">Upload Avatar Image</Label>
          <Input
            id="avatar"
            onChange={handleFileChange}
            type="file"
            accept="image/*"
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
};
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
export default Register;
