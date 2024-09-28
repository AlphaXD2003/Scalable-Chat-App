import { useState, FormEvent, useCallback } from "react";
import { Input } from "@/components/ui/input";

import { Toaster } from "./ui/toaster";
import { Label } from "./ui/label";

import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import axios from "axios";
import { useUserContext } from "@/context/UserContext";
import { Link, Navigate, useNavigate } from "react-router-dom";

interface LoginProps {
  [key: string]: any;
}
const Login = ({ ...props }: LoginProps) => {
  const [uservalue, setUserValue] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { toast } = useToast();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/login`,
        {
          uservalue,
          password,
        },
        { withCredentials: true }
      );

      console.log(response.data.data);
      setUser({
        username: response.data.data.username,
        firstname: response.data.data.firstname,
        lastname: response.data.data.lastname,
        isVerified: response.data.data.isVerified,
        isAdmin: response.data.data.isAdmin,
        email: response.data.data.email,
        id: response.data.data.id,
        avatar: response.data.data.avatar,
      });
      toast({
        title: "Successfully Logged in",
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error while logging in",
      });
    }
  };
  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <Toaster />
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Login to InChat
      </h2>
      <div className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Don't have an account ?{" "}
        <Link className="text-blue-600" to="/register">
          Create One
        </Link>
      </div>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer>
          <Label htmlFor="uservalue">Username or Email </Label>
          <Input
            value={uservalue}
            onChange={(e) => setUserValue(e.target.value)}
            id="uservalue"
            placeholder="Enter username or email"
            type="text"
            autoComplete="username"
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4 mt-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign in &rarr;
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
export default Login;
