import React, {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";

export interface UserInterface {
  username: string;
  firstname: string;
  lastname: string;
  isVerified: boolean;
  isAdmin: boolean;
  email: string;
  id: string;
}

export interface UserContextType {
  user: UserInterface;
  setUser: Dispatch<SetStateAction<any>>;
}

const UserContext = createContext<UserContextType | null>(null);
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
const UserContextProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<any>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
