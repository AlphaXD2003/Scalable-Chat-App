import React, { createContext, ReactElement, useContext } from "react";

const UserContext = createContext(null);
const useUserContext = () => {
  const info = useContext(UserContext);
  return info;
};
const UserContextProvider = ({ children }: { children: ReactElement }) => {
  return <UserContext.Provider value={null}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
