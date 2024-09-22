import RegsiterImage from "../../public/loginsignup.svg";
import Register from "@/components/Register";

const RegsiterPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="lg:min-w-[60%] lg:min-h-[100%] flex justify-center items-center">
        <img src={RegsiterImage} />
      </div>
      <div className="lg:min-w-[40%]  flex  justify-center items-center min-h-screen border">
        <Register className="lg:h-[600px]" />
      </div>
    </div>
  );
};

export default RegsiterPage;
