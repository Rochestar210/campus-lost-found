import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input style={styles.input} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button style={styles.button} type="submit">Login</button>
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: "60px auto", padding: 20 },
  form: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 },
  input: { padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" },
  button: { padding: 12, fontSize: 16, borderRadius: 6, border: "none",
    background: "#2563eb", color: "white", cursor: "pointer" },
};