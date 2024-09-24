import React from "react";
import { Send, Menu, Phone, Video, Search, MoreVertical } from "lucide-react";
const ChatArea = () => {
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div>
          <h2 className="font-semibold text-gray-100">"Select a contact"</h2>
        </div>
        <div className="flex items-center space-x-4 text-gray-300">
          <Phone size={20} />
          <Video size={20} />
          <Search size={20} />
          <MoreVertical size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4"></div>
    </div>
  );
};

export default ChatArea;
