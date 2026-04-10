import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function Signup({ setPage }) {
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const register = async () => {
    try {
      await axios.post(`${API}/register/`, {
        username,
        password
      });

      alert("Signup successful ✅");
      setPage("login");

    } catch {
      alert("Signup failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Create Account 🚀</h2>

        <input placeholder="Username" onChange={e => setU(e.target.value)} style={styles.input}/>
        <input type="password" placeholder="Password" onChange={e => setP(e.target.value)} style={styles.input}/>

        <button onClick={register} style={styles.btn}>Register</button>

        <p onClick={() => setPage("login")} style={styles.link}>
          Already have account? Login
        </p>
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
    background: "linear-gradient(135deg,#ff00cc,#3333ff)"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    padding: 30,
    borderRadius: 15,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "none"
  },
  btn: {
    padding: 12,
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 10
  },
  link: {
    cursor: "pointer",
    color: "white",
    textDecoration: "underline"
  }
};