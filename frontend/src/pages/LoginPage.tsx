import Login from "@/components/Login";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <BackgroundBeamsWithCollision className="h-screen">
      <div className="w-full h-full flex justify-center items-center">
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
          What&apos;s cooler than Chatting?{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
              <span className="">Chatting with InChat</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">Chatting with InChat</span>
            </div>
          </div>
        </h2>
        <div className="lg:min-w-[40%]  flex  justify-center items-center min-h-screen border">
          <Login className="lg:h-[600px]" />
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
};

export default LoginPage;
