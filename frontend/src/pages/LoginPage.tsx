import Login from "@/components/Login";
import LoginImage from "../../public/loginsignup.svg";

const LoginPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="lg:min-w-[60%] lg:min-h-[100%] flex justify-center items-center">
        <img src={LoginImage} />
      </div>
      <div className="lg:min-w-[40%]  flex  justify-center items-center min-h-screen border">
        <Login className="lg:h-[600px]" />
      </div>
    </div>
  );
};

export default LoginPage;
