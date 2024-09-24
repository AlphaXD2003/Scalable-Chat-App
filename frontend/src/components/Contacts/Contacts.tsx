import { useUserContext } from "@/context/UserContext";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Audio } from "react-loader-spinner";
import {
  MessageSquare,
  Send,
  Menu,
  Phone,
  Video,
  MoreVertical,
  Search,
  User,
} from "lucide-react";
import ChatArea from "./ChatArea";
interface ContactInterface {
  savedEmail: string;
  saversEmail: string;
  __v: number;
  _id: string;
}
const Contacts = () => {
  const { user } = useUserContext();
  const [contacts, setContacts] = useState<ContactInterface[] | null>(null);
  const fetchContacts = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/contact`,
        { id: user.id },
        {
          withCredentials: true,
        }
      );
      console.log(response.data.data);
      setContacts(response.data.data);
    } catch (error) {}
  }, [user, user?.id, contacts, setContacts]);

  const [inputText, setInputText] = useState("");

  const [selectedContact, setSelectedContact] =
    useState<ContactInterface | null>(null);

  useEffect(() => {
    if (user && user.id) {
      (async () => {
        await fetchContacts();
      })();
    }
  }, [user]);
  if (!contacts) {
    return (
      <>
        <Audio />
      </>
    );
  } else
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
        {/* Contacts List */}
        <div className="w-1/3  bg-gray-800 border-r border-gray-700">
          <div className="bg-gray-900 p-4 flex justify-between items-center ">
            <User size={24} />
            <div className="flex space-x-4">
              <MessageSquare size={24} className="text-gray-300" />
              <MoreVertical size={24} className="text-gray-300" />
            </div>
          </div>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search or start new chat"
                className="w-full  bg-gray-700 text-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-120px)]">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center p-4 hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h3 className="font-semibold">{contact.savedEmail}</h3>
                  {/* <p className="text-sm text-gray-600">{contact.lastMessage}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <ChatArea />
      </div>
    );
};

export default Contacts;
