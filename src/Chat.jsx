import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "https://sureshps.pythonanywhere.com/api";

export default function Chat({ setUser }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [convos, setConvos] = useState([]);
  const [currentConvo, setCurrentConvo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const user_id = localStorage.getItem("user_id") || 1;

  // INIT
  useEffect(() => {
    loadConversations();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (e) => {
        setMsg(e.results[0][0].transcript);
      };
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 🔊 SPEAKER
  const speak = (text) => {
    if (!text) return;
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // ✅ LOAD CONVERSATIONS
  const loadConversations = async () => {
    try {
      const res = await axios.get(
        `${API}/conversations/?user_id=${user_id}`
      );

      const updated = res.data.map((c) => ({
        ...c,
        preview: c.last_message || "No messages yet",
        title: c.title || "Untitled Chat",
      }));

      setConvos(updated);

      // ✅ Always load latest chat
      if (updated.length > 0) {
        loadMessages(updated[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // LOAD MESSAGES
  const loadMessages = async (id) => {
    try {
      setCurrentConvo(id);

      const res = await axios.get(
        `${API}/messages/?conversation_id=${id}`
      );

      setChat(
        res.data.map((m) => ({
          type: m.role === "assistant" ? "bot" : "user",
          text: m.content,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // NEW CHAT
  const newChat = () => {
    setChat([]);
    setCurrentConvo(null);
  };

  // SEND MESSAGE
  const send = async () => {
    if (!msg.trim()) return;

    const text = msg;
    setMsg("");

    setChat((prev) => [...prev, { type: "user", text }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/send/`, {
        user_id,
        message: text,
        conversation_id: currentConvo,
        memory: true,
      });

      setChat((prev) => [
        ...prev,
        { type: "bot", text: res.data.reply },
      ]);

      setCurrentConvo(res.data.conversation_id);

      // refresh sidebar
      loadConversations();
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { type: "bot", text: "❌ Server error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // VOICE
  const startVoice = () => {
    recognitionRef.current?.start();
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>🤖 AI Chat</h2>

        <input
          placeholder="🔍 Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <button style={styles.newBtn} onClick={newChat}>
          + New Chat
        </button>

        <div style={styles.convoList}>
          {convos
            .filter((c) =>
              (c.title || "")
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((c) => (
              <div
                key={c.id}
                onClick={() => loadMessages(c.id)}
                style={{
                  ...styles.convo,
                  background:
                    currentConvo === c.id
                      ? "rgba(0,242,254,0.3)"
                      : "transparent",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {c.title || "Untitled Chat"}
                </div>

                <div style={styles.preview}>
                  {c.preview || "No messages yet"}
                </div>
              </div>
            ))}
        </div>

        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      {/* CHAT AREA */}
      <div style={styles.chatArea}>
        <div style={styles.header}>💬 Smart AI Assistant</div>

        <div style={styles.chatBox}>
          {chat.length === 0 && (
            <div style={{ color: "white", opacity: 0.7 }}>
              Start chatting 🚀
            </div>
          )}

          {chat.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  c.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.msg,
                  background:
                    c.type === "user"
                      ? "linear-gradient(135deg,#ff512f,#dd2476)"
                      : "rgba(255,255,255,0.2)",
                }}
              >
                {c.text}

                {c.type === "bot" && (
                  <div
                    style={styles.speaker}
                    onClick={() => speak(c.text)}
                  >
                    🔊
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <div style={styles.typing}>🤖 Thinking...</div>}

          <div ref={bottomRef}></div>
        </div>

        {/* INPUT */}
        <div style={styles.inputArea}>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />

          <button onClick={startVoice} style={styles.voice}>
            🎤
          </button>

          <button onClick={send} style={styles.send}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ STYLES (FIXED ERROR)
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1677442136019-21780ecad995')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "Inter",
  },

  sidebar: {
    width: 260,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(15px)",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  logo: { fontSize: 20, marginBottom: 10 },

  search: {
    padding: 10,
    borderRadius: 10,
    border: "none",
    marginBottom: 10,
  },

  newBtn: {
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    color: "white",
    marginBottom: 10,
  },

  convoList: { flex: 1, overflowY: "auto" },

  convo: {
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 5,
  },

  preview: { fontSize: 12, opacity: 0.7 },

  logout: {
    background: "#ff4d4d",
    border: "none",
    padding: 10,
    borderRadius: 10,
    color: "white",
  },

  chatArea: {
    flex: 1,
    padding: 20,
    backdropFilter: "blur(10px)",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    fontSize: 22,
    color: "white",
    marginBottom: 10,
  },

  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  msg: {
    padding: 14,
    borderRadius: 18,
    color: "white",
    maxWidth: "60%",
  },

  speaker: {
    marginTop: 5,
    cursor: "pointer",
  },

  typing: { color: "white", opacity: 0.8 },

  inputArea: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "none",
  },

  send: {
    background: "linear-gradient(135deg,#ff512f,#dd2476)",
    border: "none",
    padding: 10,
    borderRadius: 10,
    color: "white",
  },

  voice: {
    background: "linear-gradient(135deg,#00f2fe,#4facfe)",
    border: "none",
    padding: 10,
    borderRadius: 10,
    color: "white",
  },
};