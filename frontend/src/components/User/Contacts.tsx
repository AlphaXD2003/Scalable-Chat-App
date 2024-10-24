import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

interface ContactInterface {
  _id: string;
  savedEmail: string;
  saversEmail: string;
}
interface Props {
  selectedConversationRef: any;
  setSelectedConversation: any;
  setNewContactPage: any;
  handleSelectConversation: any;
}
const Contacts = ({
  selectedConversationRef,
  setSelectedConversation,
  setNewContactPage,
  handleSelectConversation,
}: Props) => {
  const [contacts, setContacts] = useState<ContactInterface[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatars, setAvatars] = useState<{ [key: string]: string }>({});
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const { user } = useUserContext();
  const handleFetchContact = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/contact`,
        {
          id: user.id.toString(),
        },
        { withCredentials: true }
      );
      console.log(response.data.data);
      setContacts(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleAvatar = async (email: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/emaildetails`,
        { email },
        { withCredentials: true }
      );
      return response.data.data.avatar;
    } catch (error) {
      console.error("Error fetching avatar:", error);
      return "";
    }
  };
  const handleUsernames = async (email: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/emaildetails`,
        { email },
        { withCredentials: true }
      );
      return response.data.data.username;
    } catch (error) {
      console.error("Error fetching avatar:", error);
      return "";
    }
  };

  useEffect(() => {
    (async () => await handleFetchContact())();
  }, []);
  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars: { [key: string]: string } = {};
      for (const contact of contacts) {
        newAvatars[contact.savedEmail] = await handleAvatar(contact.savedEmail);
      }
      setAvatars(newAvatars);
    };
    const fetchUsernames = async () => {
      const newUsernames: { [key: string]: string } = {};
      for (const contact of contacts) {
        newUsernames[contact.savedEmail] = await handleUsernames(
          contact.savedEmail
        );
      }
      setUsernames(newUsernames);
    };

    if (contacts.length > 0) {
      fetchAvatars();
      fetchUsernames();
    }
  }, [contacts]);
  if (loading) {
    return <Skeleton>Loading</Skeleton>;
  } else {
    return (
      <div className="w-full h-screen flex ">
        {contacts.length > 0 ? (
          <div className="w-full items-center justify-center m-10 border">
            <div className="text-xl mb-4">All Saved Contacts</div>
            <div className=" flex flex-col gap-2">
              {contacts.map((contact, index) => {
                return (
                  <div
                    key={index}
                    className="cursor-pointer lg:min-w-[400px] lg:min-h-5 border p-3 rounded-xl bg-gray-800"
                    onClick={() => {
                      selectedConversationRef.current =
                        usernames[contact.savedEmail];
                      setSelectedConversation(usernames[contact.savedEmail]);
                      setNewContactPage(false);
                      handleSelectConversation(
                        usernames[contact.savedEmail],
                        true,
                        avatars[contact.savedEmail]
                      );
                    }}
                  >
                    <div className="flex flex-row justify-start items-center gap-4">
                      <img
                        src={avatars[contact.savedEmail] || ""}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>{usernames[contact.savedEmail]?.toUpperCase()}</div>
                      <div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>No saved contacts.</div>
        )}
      </div>
    );
  }
};

export default Contacts;
