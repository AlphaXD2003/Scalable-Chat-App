import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginProps {
  [key: string]: any;
}
const Login = ({ ...props }: LoginProps) => {
  const [uservalue, setUserValue] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  return (
    <div
      className={`${props?.className} border-2 rounded-lg lg:p-10 flex flex-col justify-center `}
    >
      <div className="lg:w-[600px] lg:mb-4">
        <Input
          type="text"
          placeholder="Enter your email or username.."
          value={uservalue}
          onChange={(e) => setUserValue(e.target.value)}
        />
      </div>
      <div className="lg:w-[600px] lg:mb-4">
        <Input
          type="password"
          placeholder="Enter your password.."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="ml-auto">
        <Button className="lg:w-[100px] lg:h-[50px]" variant="outline">
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
