import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <input style={styles.input} placeholder="Full Name" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password (6+ chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="finder">Finder</option>
        </select>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button style={styles.button} type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
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