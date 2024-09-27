import axios from "axios";
import React, { useEffect, useState } from "react";
import { Audio } from "react-loader-spinner";
interface ContactInterface {
  savedEmail: string;
}

interface User {
  avatar: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  _id: string;
}

const ContactCard = ({
  contact,
  setUserDetails,
  selectedContact,
}: {
  contact: ContactInterface;
  setUserDetails: any;
  selectedContact: User | null;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const getUserDetailsFromEmail = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/emaildetails`,
        { email: contact.savedEmail },
        { withCredentials: true }
      );
      console.log(response.data.data);
      setUser(response.data.data);
      setUserDetails((prev: any) => [...prev, { ...response.data.data }]);
    } catch (error) {}
  };
  useEffect(() => {
    (async () => await getUserDetailsFromEmail())();
  }, []);
  if (!user) return <Audio />;
  return (
    <>
      <div className="w-12 h-12 bg-gray-300 rounded-full mr-4">
        <img src={user.avatar} className="w-12 h-12 rounded-full" />
      </div>
      <div>
        <h3 className="font-semibold">{user.username.toUpperCase()}</h3>
        {/* <p className="text-sm text-gray-600">{contact.lastMessage}</p> */}
      </div>
    </>
  );
};

export default ContactCard;
