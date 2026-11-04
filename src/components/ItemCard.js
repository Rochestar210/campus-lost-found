import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ItemCard({ item, currentUser }) {
  const isLost = item.type === "lost";
  const isOwner = currentUser && currentUser.uid === item.reporterId;

  const handleMarkReturned = async () => {
    if (window.confirm("Mark this item as returned/resolved?")) {
      await updateDoc(doc(db, "items", item.id), { status: "returned" });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "items", item.id));
    }
  };

  return (
    <div style={styles.card}>
      <span style={{ ...styles.badge, background: isLost ? "#dc2626" : "#16a34a" }}>
        {item.type.toUpperCase()}
      </span>
      <h3 style={styles.title}>{item.title}</h3>
      <p style={styles.desc}>{item.description}</p>
      <p style={styles.meta}>📍 {item.location}</p>
      <p style={styles.meta}>📅 {isLost ? item.dateLost : item.dateFound}</p>
      <p style={styles.meta}>🏷️ {item.category}</p>
      
      <p style={{ ...styles.status, color: item.status === "returned" ? "#16a34a" : "#2563eb" }}>
        Status: {item.status.toUpperCase()}
      </p>

      {/* Only show these buttons if the logged-in user owns the post */}
      {isOwner && item.status !== "returned" && (
        <div style={styles.actions}>
          <button onClick={handleMarkReturned} style={styles.returnBtn}>✅ Returned</button>
          <button onClick={handleDelete} style={styles.deleteBtn}>🗑️ Delete</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { background: "white", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 6 },
  badge: { alignSelf: "flex-start", color: "white", fontSize: 11, fontWeight: "bold", padding: "3px 8px", borderRadius: 4 },
  title: { fontSize: 16, marginTop: 4 },
  desc: { fontSize: 14, color: "#555" },
  meta: { fontSize: 13, color: "#777" },
  status: { fontSize: 12, marginTop: 6, fontWeight: "bold" },
  actions: { display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" },
  returnBtn: { flex: 1, padding: "6px", background: "#10b981", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  deleteBtn: { flex: 1, padding: "6px", background: "#ef4444", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
};