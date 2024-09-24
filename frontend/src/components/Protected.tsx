import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { ReactElement, useCallback, useEffect } from "react";

import { useToast } from "@/hooks/use-toast";
import { Outlet, useNavigate } from "react-router-dom";

const Protected = () => {
  const { setUser } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const getUser = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/userinfo`,
        {},
        {
          withCredentials: true,
        }
      );

      setUser({
        username: response.data.data.username,
        firstname: response.data.data.firstname,
        lastname: response.data.data.lastname,
        isVerified: response.data.data.isVerified,
        isAdmin: response.data.data.isAdmin,
        email: response.data.data.email,
        id: response.data.data._id,
        avatar: response.data.data.avatar,
      });
    } catch (error) {
      navigate("/login");
      toast({
        title: "Error while getting the user details.",
      });
    }
  }, []);

  useEffect(() => {
    (async () => await getUser())();
  }, []);

  return (
    <>
      {" "}
      <Outlet />
    </>
  );
};

export default Protected;
