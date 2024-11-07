import React, { useState, useEffect, useCallback, useRef } from "react";
import ConversationCard from "./ConversationCard";
import ChatArea from "./ChatArea";
import { useSocket } from "@/context/SocketContext";
import { messageService } from "@/services/messageService";
import { conversationService } from "@/services/conversationService";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import { useUserContext } from "@/context/UserContext";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  MessageSquare,
  Send,
  Menu,
  Phone,
  Video,
  MoreVertical,
  Search,
  User,
  ChartAreaIcon,
  ChartBar,
  Cross,
  CrossIcon,
  DeleteIcon,
  PlusCircle,
  Contact,
  AudioLinesIcon,
  AudioLines,
  BellMinusIcon,
  BellElectricIcon,
} from "lucide-react";
import CreateNewContact from "./CreateNewContact";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastProvider } from "../ui/toast";
import Contacts from "../User/Contacts";
import CreateNewGroup from "./CreateNewGroup";
import { usePeerContext } from "@/context/PeerContext";
import IncomingCallNotification from "../Call/CallCompnent";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  avatar: string;
  messageId: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}
interface MessageLoad {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface IncomingMessage {
  message: string;
  sender: string;
  type: string;
  uid: string;
  username: string;
}

interface IncomingGroupMessage {
  message: string;
  type: string;
  groupname: string;
  roomType: string;
  uid: string;
  sender: string;
}

interface IncomingOfflineMessages {
  username: string;
  message: string;
  type: string;
  mid: string;
  sender: string;
  uid: string;
  time: Date;
  roomType: "private" | "group";
  createdAt: Date;
}

interface IncomingDeleteMessage {
  messageId: string;
  name: string;
  timestamp: Date;
  from: string;
}

interface IncomingOfflineGroupMessage {
  createdAt?: Date;
  message: string;
  roomId?: string;
  groupname?: string;
  sender: string;
  sendingTime: Date;
  type: string;
  uid: string;
  receiver: string;
  time?: number;
}

const Home: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(true);
  const [calling, setCalling] = useState<boolean>(false);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callGranted, setCallGranted] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchContact, setSearchContact] = useState<string>("");
  // open
  const [newContact, setNewContact] = useState<boolean>(false);
  const [newGroup, setNewGroup] = useState<boolean>(false);
  const [newContactPage, setNewContactPage] = useState<boolean>(false);

  // Socket
  const [socket] = useSocket();
  console.log(socket);
  const selectedConversationRef = useRef<string | null>(null);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const {
    type,
    incomingCall,
    setIncomingCall,
    createCall,
    createAnswer,
    peer,
    localStream,
    setLocalStream,
    setRemoteStream,
    remoteStream,
    sendStream,
  } = usePeerContext();

  const handleMessageReceive = useCallback(async (data: IncomingMessage) => {
    console.log("123", selectedConversation);
    console.log(data);
    await messageService.addMessage({
      conversationId: data.sender,
      id: data.uid,
      sender: data.sender,
      text: data.message,
      timestamp: new Date(),
    });

    const userDeatils = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
      {
        username: data.sender,
      },
      { withCredentials: true }
    );

    await conversationService.updateConversation(data.sender, {
      conversationId: data.sender,
      id: data.sender,
      sender: "other",
      text: data.message,
      timestamp: new Date(),
      avatar: userDeatils.data.data.avatar,
      messageId: data.uid,
    });
    console.log("sender data: ", data.sender);
    console.log("selected conversation: ", selectedConversation);

    if (
      selectedConversation == data.sender ||
      selectedConversationRef.current === data.sender
    ) {
      console.log("true");
      // await conversationService.updateUnReadMessage(data.sender);
      // await loadMessages(data.sender);
      setMessages((prev) => [
        ...prev,
        {
          conversationId: data.sender,
          id: data.uid,
          sender: data.sender,
          text: data.message,
          timestamp: new Date(),
        },
      ]);
    }
    await loadConverSationFromLocally();
  }, []);
  const handleGroupMessageReceive = useCallback(
    async (data: IncomingGroupMessage) => {
      console.log("gdata : ", data);
      await messageService.addMessage({
        conversationId: data.groupname,
        id: data.uid,
        sender: data.sender,
        text: data.message,
        timestamp: new Date(),
      });
      if (selectedConversationRef.current === data.groupname) {
        await loadMessages(data.groupname);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/group/group_details_name`,
        {
          name: data.groupname,
        },
        { withCredentials: true }
      );
      await conversationService.updateConversation(data.groupname, {
        conversationId: data.sender,
        id: data.groupname,
        sender: "other",
        text: data.message,
        timestamp: new Date(),
        avatar: response.data.data.avatar,
        messageId: data.uid,
      });
      if (data.groupname === selectedConversation) {
        await conversationService.updateUnReadMessage(data.groupname);
      }
      await loadConverSationFromLocally();
    },
    [socket]
  );

  const handleOfflinePrivateMessage = useCallback(
    async (data: IncomingOfflineMessages[]) => {
      try {
        console.log(data);

        // Sort the messages by timestamp
        data.sort(
          (a, b) =>
            new Date(a.time || a.createdAt).getTime() -
            new Date(b.time || b.createdAt).getTime()
        );

        // Process each message sequentially
        for (const msg of data) {
          try {
            await messageService.addMessage({
              conversationId: msg.sender,
              id: msg.uid,
              sender: msg.sender,
              text: msg.message,
              timestamp: msg.time || msg.createdAt,
            });
            const userDeatils = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
              {
                username: msg.sender,
              },
              { withCredentials: true }
            );
            await conversationService.updateConversation(msg.sender, {
              conversationId: msg.sender,
              id: msg.sender,
              messageId: "sd",
              sender: "other",
              text: msg.message,
              timestamp: msg.time || msg.createdAt,
              avatar: userDeatils.data.data.avatar,
            });
          } catch (error) {
            console.error("Error processing message:", error);
          }
        }

        // Load conversations from local storage
        await loadConverSationFromLocally();
      } catch (error) {
        console.error("Error handling offline private messages:", error);
      }
    },
    [socket]
  );
  const sendDelete = useCallback(
    async (mid: string, username: string, cid: string) => {
      console.log({ mid, username, cid });
      socket?.emit("delete_message", {
        messageId: mid,
        name: cid,
        username: username,
      });
    },
    [socket]
  );
  const handleDeleteMessage = useCallback(
    async (data: IncomingDeleteMessage) => {
      const { messageId, name, timestamp, from } = data;
      console.log(data);
      console.log("Timestamp:", timestamp);
      console.log("MessageId:", messageId);
      await messageService.deleteMessage(messageId);
      const conversation = await conversationService.getConversationFromMid(
        messageId
      );
      console.log(conversation);
      if (conversation?.id) {
        console.log("cTimestamp:", conversation.lastMessageTimestamp);
        await conversationService.updateLastMessage(
          conversation?.id,
          "This Message was deleted"
        );
      }
      await loadConverSationFromLocally();
      console.log("Name", from);
      console.log("Selected C", selectedConversation);
      if (
        name === selectedConversation ||
        name === selectedConversationRef.current ||
        from === selectedConversationRef.current
      ) {
        if (selectedConversationRef.current !== null) {
          await loadMessages(selectedConversationRef.current);
        }
      }
    },
    [socket]
  );

  const handleOfflineDeleteMessage = useCallback(
    async (data: string[]) => {
      console.log(data);
      for (const msg of data) {
        console.log("msg", msg);
        await messageService.deleteMessage(msg);
        const conv = await conversationService.getConversationFromMid(msg);
        console.log("conv", conv);
        if (conv) {
          const lastConversation = await conversationService.getConversation(
            conv.id
          );
          console.log("lastconv", lastConversation);
          if (lastConversation?.messageId === msg) {
            await conversationService.updateLastMessage(
              conv.id,
              "This Message was deleted"
            );
          }
        }
      }
      await loadConverSationFromLocally();
    },
    [socket]
  );

  const handleOfflineGroupMessage = useCallback(
    async (data: IncomingOfflineGroupMessage[]) => {
      console.log("Offline Group Message: ", data);
      for (const msg of data) {
        console.log("grp: ", msg);
        await messageService.addMessage({
          conversationId: msg.groupname || msg.roomId || "",
          id: msg.uid,
          sender: msg.sender,
          text: msg.message,
          timestamp: new Date(msg?.time || msg?.createdAt || Date.now()),
        });
        const groupDetails = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/group//group_details_name`,
          {
            name: msg.groupname || msg.roomId,
          },
          { withCredentials: true }
        );
        console.log(groupDetails);
        if (msg.groupname) {
          const conversation = await conversationService.updateConversation(
            msg.groupname,
            {
              conversationId: msg.groupname,
              id: msg.groupname,
              messageId: msg.uid,
              sender: "other",
              text: msg.message,
              avatar: groupDetails.data.data.avatar,
              user: msg.sender,
              timestamp: new Date(msg.time || msg.createdAt || Date.now()),
            }
          );
          if (selectedConversationRef.current == msg.groupname) {
            loadMessages(msg.groupname);
          }
        } else if (msg.roomId) {
          const conversation = await conversationService.updateConversation(
            msg.roomId,
            {
              conversationId: msg.roomId,
              id: msg.roomId,
              messageId: msg.uid,
              sender: "other",
              text: msg.message,
              avatar: groupDetails.data.avatar,
              user: msg.sender,
              timestamp: new Date(msg.time || msg.createdAt || Date.now()),
            }
          );
          if (selectedConversationRef.current == msg.roomId) {
            loadMessages(msg.roomId);
          }
        }
      }
      await loadConverSationFromLocally();
    },
    []
  );

  const { toast } = useToast();

  const handleCallAccepted = useCallback(async (data: any) => {
    console.log(data);
    const offer = await createCall();
    const roomId = `${user.username}-${data.calledId}`;
    socket?.emit("signal:from", { ...data, offer, roomId });
    socket?.emit("selfjoin", roomId);
  }, []);

  const handleAnswerGen = useCallback(async (data: any) => {
    console.log(data);
    const { roomId, calledId, callerId, offer } = data;
    const answer = await createAnswer(offer);
    socket?.emit("selfjoin", roomId);
    socket?.emit("send:answer:from", { ...data, answer });
  }, []);

  const handleAnsRec = useCallback(async (data: any) => {
    console.log(data);
    await peer?.setRemoteDescription(new RTCSessionDescription(data.answer));
    setCallAccepted(true);
  }, []);

  useEffect(() => {
    if (socket) {
      console.log("onning events");
      socket.on("receive_message", handleMessageReceive);
      socket.on("receive_group_message", handleGroupMessageReceive);
      socket.on("message:offline", handleOfflinePrivateMessage);
      socket.on("groupmessage:offline", handleOfflineGroupMessage);
      socket.on("delete_msg_online", handleDeleteMessage);
      socket.on("delete_msg_offline", handleOfflineDeleteMessage);
      socket.on("call:accepted:by", handleCallAccepted);
      socket.on("signal:to", handleAnswerGen);
      socket.on("receivedAnswer", handleAnsRec);
    }

    return () => {
      if (socket) {
        console.log("offing events");
        socket.off("receive_message", handleMessageReceive);
        socket.off("receive_group_message", handleGroupMessageReceive);
        socket.off("message:offline", handleOfflinePrivateMessage);
        socket.off("groupmessage:offline", handleOfflineGroupMessage);
        socket.off("delete_msg_online", handleDeleteMessage);
        socket.off("delete_msg_offline", handleOfflineDeleteMessage);
        socket.off("call:accepted:by", handleCallAccepted);
        socket.off("signal:to", handleAnswerGen);
        socket.off("receivedAnswer", handleAnsRec);
      }
    };
  }, [socket]);

  const [dataSelectedCov, setDataSelectedConv] = useState<any>(null);
  const loadSelectedConRefData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/usernamedetails`,
        {
          username: selectedConversationRef.current,
        },
        { withCredentials: true }
      );
      setDataSelectedConv(response.data.data);
    } catch (error) {}
  }, [selectedConversationRef.current]);

  useEffect(() => {
    if (selectedConversationRef.current) {
      (async () => await loadSelectedConRefData())();
    }
  }, [selectedConversationRef.current]);

  const loadMessages = useCallback(async (cid: string) => {
    try {
      console.log("loadM", cid);
      const length = await messageService.getTotalMessageCount(cid);
      console.log(length);
      const data = await messageService.getMessages(0, 20, cid);
      console.log("ddata", data);
      const transformedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
      }));
      console.log("transformedMessages,", transformedMessages);
      setMessages((prev) => {
        return transformedMessages;
      });
    } catch (error) {}
  }, []);

  const handleSelectConversation = async (
    id: string,
    isUser: boolean,
    avatar?: string
  ) => {
    console.log(isUser);
    console.log(id);

    const conv = await conversationService.getConversation(id);
    console.log("conv1:", conv);
    if (conv?.id) {
      await conversationService.updateUnReadMessage(id);
      await conversationService.loadConversations();
      await loadConverSationFromLocally();
      await loadMessages(id);
    } else {
      await conversationService.updateConversation(id, {
        conversationId: id,
        messageId: Math.random().toString() + Date.now().toString(),
        id: id,
        sender: "self",
        text: " ",
        timestamp: new Date(),
        avatar: avatar || "",
      });

      setSelectedConversation(id);

      setNewContactPage(false);
      setNewGroup(false);
      setNewContact(false);
      await conversationService.loadConversations();
      await loadConverSationFromLocally();
      selectedConversationRef.current = id;
      await loadMessages(id);
    }
  };
  const { user } = useUserContext();
  const checkUserOrgroup = async () => {
    console.log("Conversation Id:", selectedConversationRef.current);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/checkuserorgroup`,
        {
          name: selectedConversationRef.current,
        },
        { withCredentials: true }
      );
      console.log({
        "Id: ": selectedConversationRef.current,
        data: response.data.data,
      });
      return response.data.data;
    } catch (error) {
      console.log("cerror", error);
    }
  };
  const handleSendMessage = async (text: string, cid: string) => {
    console.log("CID: ", cid);

    const isuser = await checkUserOrgroup();
    const mid = `${user.username}-${cid}-${Date.now()}`;
    const newMessage: any = {
      id: mid,
      text,
      sender: user.username,
      timestamp: new Date(),
    };
    // setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (isuser) {
      socket?.emit("send_message", {
        username: cid,
        message: text,
        mid,
      });
      await messageService.addMessage({
        ...newMessage,
        conversationId: cid,
      });
      // await loadMessages(cid);
      setMessages((prev) => [...prev, newMessage]);
    } else {
      socket?.emit("group_message_send", {
        message: text,
        type: "text",
        groupname: cid,
        roomType: "group",
        mid,
      });
    }
    await conversationService.updateLastMessage(cid, text);
    await loadConverSationFromLocally();
  };
  const loadConverSationFromLocally = async () => {
    const data = await conversationService.loadConversations();
    console.log(data);
    setConversations(data);
  };

  const onDecline = () => {
    setIncomingCall(false);
  };
  const [incomingCallId, setIncomingCallId] = useState<string>("");
  const [incomingCallIdAvatar, setIncomingCallIdAvatar] = useState<string>("");
  const onAccept = (data?: any) => {
    console.log("1");
    setCallGranted(true);
    const { callerName, avatar } = data;
    if (data) {
      setIncomingCallId(callerName);
      setIncomingCallIdAvatar(avatar);
    }
  };

  const emitDeleteMessage = async (
    messageId: string,
    conversationId: string
  ) => {
    socket?.emit("delete_message", { messageId, name: conversationId });
  };

  const handleLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    setLocalStream(stream);
  }, [peer, calling, callAccepted]);

  useEffect(() => {
    if (calling || callAccepted) {
      handleLocalStream();
    }
  }, [peer, calling]);

  useEffect(() => {});

  useEffect(() => {
    (async () => {
      await loadConverSationFromLocally();
    })();
  }, []);
  if (!user) {
    return <Audio />;
  } else
    return (
      <div
        className="flex h-screen bg-gray-900 text-white"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSelectedConversation(null);
            selectedConversationRef.current = null;
            setNewContactPage(false);
          }
        }}
        tabIndex={5}
      >
        <ToastProvider />
        <div className="w-1/3 bg-gray-800 border-r overflow-y-auto">
          <div className="bg-gray-900 p-4 flex justify-between items-center ">
            <img src={user?.avatar} className="w-10 h-10 rounded-full" />
            <div className="flex space-x-4">
              <Popover className="relative">
                <PopoverButton>
                  <PlusCircle
                    size={24}
                    className="text-gray-300 cursor-pointer"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  anchor="bottom"
                  className="divide-y divide-white/5 rounded-xl cursor-pointer bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                >
                  <div className="p-3">
                    <div className="block rounded-lg py-2 px-3 transition hover:bg-white/5">
                      <p
                        className="font-semibold text-white"
                        onClick={() => setNewContact(true)}
                      >
                        New Contact
                      </p>
                      <p className="text-white/50">Create a new contact</p>
                    </div>

                    <div
                      onClick={() => setNewGroup(true)}
                      className="block rounded-lg py-2 px-3 transition hover:bg-white/5"
                    >
                      <p className="font-semibold text-white">
                        Create new Group
                      </p>
                      <p className="text-white/50">
                        Create a group and add members
                      </p>
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>
              <Contact
                onClick={() => {
                  setNewContactPage(true);
                }}
                size={24}
                className="text-gray-300 cursor-pointer"
              />

              {muted ? (
                <BellMinusIcon
                  onClick={() => setMuted(false)}
                  size={24}
                  className="text-gray-300 cursor-pointer"
                />
              ) : (
                <BellElectricIcon
                  onClick={() => setMuted(true)}
                  size={24}
                  className="text-gray-300 cursor-pointer"
                />
              )}
              <MoreVertical
                size={24}
                className="text-gray-300 cursor-pointer"
              />
            </div>
          </div>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full  bg-gray-700 text-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400 cursor-pointer"
                size={20}
              />
              <DeleteIcon
                className="absolute cursor-pointer right-3 top-2.5 text-gray-400 "
                size={20}
                onClick={(e) => setSearchContact("")}
              />
            </div>
          </div>
          {!searchContact &&
            conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onSelect={handleSelectConversation}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                setNewContactPage={setNewContactPage}
              />
            ))}
          {searchContact &&
            conversations
              .filter((conversation) =>
                conversation.id
                  .toLowerCase()
                  .includes(searchContact.toLowerCase())
              )
              .map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={handleSelectConversation}
                  selectedConversation={selectedConversation}
                  setSelectedConversation={setSelectedConversation}
                  setNewContactPage={setNewContactPage}
                />
              ))}
        </div>
        <div className="flex-1">
          {!newContactPage && selectedConversationRef.current ? (
            <ChatArea
              sendDelete={sendDelete}
              conversationId={selectedConversationRef.current}
              messages={messages}
              onSendMessage={handleSendMessage}
              setMessages={setMessages}
              loadConverSationFromLocally={loadConverSationFromLocally}
              emitDeleteMessage={emitDeleteMessage}
              loadMessages={loadMessages}
              setCalling={setCalling}
            />
          ) : newContactPage ? (
            <div>
              <Contacts
                setSelectedConversation={setSelectedConversation}
                selectedConversationRef={selectedConversationRef}
                setNewContactPage={setNewContactPage}
                handleSelectConversation={handleSelectConversation}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 gap-4">
              <ChartBar />
              Select a chat to start chatting
            </div>
          )}
        </div>
        {/* new contact */}
        <div
          tabIndex={10}
          onKeyDown={(e) => {
            if (e.key == "Escape") {
              setNewContact(false);
            }
          }}
        >
          <CreateNewContact
            open={newContact}
            setOpen={setNewContact}
            toast={toast}
          />
          <CreateNewGroup open={newGroup} setOpen={setNewGroup} toast={toast} />
        </div>

        {incomingCall && (
          <IncomingCallNotification
            muted={muted}
            onDecline={onDecline}
            setIncomingCall={setIncomingCall}
            onAccept={onAccept}
            setCallGranted={setCallGranted}
          />
        )}
      </div>
    );
};

export default Home;
