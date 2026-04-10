import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Chat from "./Chat";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user_id"));
  const [page, setPage] = useState("login");

  if (user) return <Chat setUser={setUser} />;

  return page === "login"
    ? <Login setUser={setUser} setPage={setPage} />
    : <Signup setPage={setPage} />;
}

export default App;