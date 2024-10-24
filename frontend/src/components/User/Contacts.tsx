import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Contact2Icon, DeleteIcon, Search } from "lucide-react";

interface ContactInterface {
  _id: string;
  savedEmail: string;
  saversEmail: string;
}
interface GroupInterface {
  _id: string;
  admin: string[];
  avatar: string;
  createdAt: string;
  description: string;
  name: string;
  super: string;
  updatedAt: string;
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
  const [groups, setGroups] = useState<GroupInterface[] | []>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const { user } = useUserContext();

  const getAllGroups = async () => {
    try {
      console.log(user.username);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/groups_username`,
        {
          username: user.username,
        },
        { withCredentials: true }
      );
      console.log(response.data.data);
      setGroups(response.data.data);
    } catch (error) {}
  };
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
    (async () => {
      await handleFetchContact();
      await getAllGroups();
    })();
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
            <div className="flex flex-col justify-start">
              <div className="text-xl mb-4 mt-2 ml-3">
                All Saved Contacts and Groups
              </div>
              <div className="relative mb-3 w-full">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search Contacts or Groups"
                  className="w-full  bg-gray-700 text-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
                  size={20}
                />
                <DeleteIcon
                  className="absolute cursor-pointer right-3 top-2.5 text-gray-400 "
                  size={20}
                />
              </div>
            </div>
            <div className=" flex flex-col gap-2">
              {contacts
                .filter((contact) => {
                  if (searchValue) {
                    return usernames[contact.savedEmail].includes(searchValue);
                  } else {
                    return true;
                  }
                })
                .map((contact, index) => {
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
                        <div>
                          {usernames[contact.savedEmail]?.toUpperCase()}
                        </div>
                        <div></div>
                      </div>
                    </div>
                  );
                })}
              {groups.length > 0 &&
                groups
                  .filter((group) => {
                    if (searchValue) {
                      return group.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase());
                    } else {
                      return true;
                    }
                  })
                  .map((group) => {
                    return (
                      <div
                        className="flex justify-start gap-4 items-center px-4 py-2 bg-gray-800 cursor-pointer rounded-lg"
                        key={group._id}
                        onClick={() => {
                          setSelectedConversation(group.name);
                          selectedConversationRef.current = group.name;
                          setNewContactPage(false);
                          handleSelectConversation(
                            group.name,
                            false,
                            group.avatar
                          );
                        }}
                      >
                        <div className="flex gap-4 justify-center items-center">
                          <img
                            src={group.avatar}
                            alt="Group Avatar"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>{group.name.toUpperCase()}</div>
                        </div>
                        <div className="ml-auto mr-4">GROUP</div>
                      </div>
                    );
                  })}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <div className="m-auto font-normal text-2xl flex gap-4 items-center justify-center text-gray-300 ">
              <Contact2Icon size={36} />
              <div className="text-gray-500">No Saved Contacts</div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Contacts;
