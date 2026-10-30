import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { addBlock } from "../blockchain/simpleChain";

export default function PostLost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("phone");
  const [location, setLocation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const docRef = await addDoc(collection(db, "items"), {
        type: "lost",
        title, description, category, location, dateLost,
        reporterId: auth.currentUser.uid,
        status: "open",
        createdAt: serverTimestamp(),
      });

      // Log this event to the blockchain
      await addBlock({
        eventType: "LOST_REPORTED",
        itemId: docRef.id,
        data: { title, description, category, location, dateLost, type: "lost" },
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Report a Lost Item</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Item title (e.g. Blue iPhone 13)"
          value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea style={styles.input} placeholder="Description" rows={3}
          value={description} onChange={(e) => setDescription(e.target.value)} required />
        <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="phone">Phone</option>
          <option value="id">Student ID</option>
          <option value="keys">Keys</option>
          <option value="books">Books</option>
          <option value="other">Other</option>
        </select>
        <input style={styles.input} placeholder="Where did you lose it?"
          value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input style={styles.input} type="date" value={dateLost}
          onChange={(e) => setDateLost(e.target.value)} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button style={styles.button} type="submit">Post Lost Item</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 500, margin: "40px auto", padding: 20 },
  form: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 },
  input: { padding: 10, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" },
  button: { padding: 12, fontSize: 16, borderRadius: 6, border: "none",
    background: "#dc2626", color: "white", cursor: "pointer" },
};