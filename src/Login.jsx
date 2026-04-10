import { useState } from "react";
import axios from "axios";

const API = "https://sureshps.pythonanywhere.com/api";

export default function Login({ setUser }) {
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login/`, {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_id", res.data.user_id);

      setUser(res.data.user_id);

    } catch {
      alert("Login failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🤖 AI Assistant</h2>

        <input
          placeholder="Username"
          onChange={e => setU(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setP(e.target.value)}
          style={styles.input}
        />

        <button onClick={login} style={styles.button}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#0f172a,#1e293b)"
  },

  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    padding: 40,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    width: 300,
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
  },

  title: {
    color: "white",
    textAlign: "center"
  },

  input: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    outline: "none"
  },

  button: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#6366f1,#3b82f6)",
    color: "white",
    cursor: "pointer"
  }
};