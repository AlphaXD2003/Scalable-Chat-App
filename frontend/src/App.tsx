import axios from "axios";
import Contacts from "./components/Contacts/Contacts";
import { useUserContext } from "./context/UserContext";
import { useEffect, useState } from "react";

function App() {
  return <Contacts />;
}

export default App;
