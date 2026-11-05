import { useState } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function ItemCard({ item, currentUser }) {
  const isLost = item.type === "lost";
  const isOwner = currentUser && currentUser.uid === item.reporterId;
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");

  // NEW: Calculate days remaining
  let daysRemaining = 0;
  if (item.status === "returned" && item.returnedAt) {
    const returnedDate = new Date(item.returnedAt);
    const deleteDate = new Date(returnedDate);
    deleteDate.setDate(deleteDate.getDate() + 30); // Add 30 days
    
    const today = new Date();
    const timeDiff = deleteDate.getTime() - today.getTime();
    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysRemaining < 0) daysRemaining = 0; // In case it's pending deletion
  }

  const handleMarkReturned = async () => {
    if (window.confirm("Mark this item as returned/resolved?")) {
      await updateDoc(doc(db, "items", item.id), { 
        status: "returned", 
        returnedAt: new Date().toISOString() 
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "items", item.id));
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please log in to claim an item.");
    try {
      await addDoc(collection(db, "claims"), {
        itemId: item.id,
        itemTitle: item.title,
        claimantId: currentUser.uid,
        claimantEmail: currentUser.email,
        message: message,
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("Claim message sent to Admin successfully!");
      setClaiming(false);
      setMessage("");
    } catch (err) {
      alert("Error sending claim: " + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please log in to comment.");
    try {
      const newComment = {
        text: comment,
        author: currentUser.email,
        date: new Date().toISOString()
      };
      
      const currentComments = item.comments || [];
      await updateDoc(doc(db, "items", item.id), {
        comments: [...currentComments, newComment]
      });
      
      setComment("");
    } catch (err) {
      alert("Error adding comment: " + err.message);
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

      {/* NEW: Countdown Display */}
      {item.status === "returned" && (
        <div style={styles.countdownBox}>
          ⏳ Auto-delete in <strong>{daysRemaining} days</strong>
        </div>
      )}

      {/* Owner Actions */}
      {isOwner && item.status !== "returned" && (
        <div style={styles.actions}>
          <button onClick={handleMarkReturned} style={styles.returnBtn}>✅ Returned</button>
          <button onClick={handleDelete} style={styles.deleteBtn}>🗑️ Delete</button>
        </div>
      )}

      {/* Claim Actions (For non-owners) */}
      {!isOwner && item.status !== "returned" && currentUser && (
        <div style={styles.actions}>
          {!claiming ? (
            <button onClick={() => setClaiming(true)} style={styles.claimBtn}>💬 Claim Item</button>
          ) : (
            <form onSubmit={handleClaimSubmit} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <textarea 
                placeholder="Describe why this is yours..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={2}
                style={styles.textarea}
              />
              <div style={{ display: "flex", gap: 4 }}>
                <button type="submit" style={styles.sendBtn}>Send to Admin</button>
                <button type="button" onClick={() => setClaiming(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Comments Section */}
      {currentUser && (
        <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px dashed #ccc" }}>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>💬 Comments</h4>
          
          {item.comments && item.comments.length > 0 ? (
            <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 10, fontSize: 12, background: "#f9fafb", padding: 8, borderRadius: 4 }}>
              {item.comments.map((c, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <strong>{c.author.split('@')[0]}:</strong> {c.text}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>No comments yet.</p>
          )}

          <form onSubmit={handleAddComment} style={{ display: "flex", gap: 6 }}>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{ flex: 1, padding: 6, fontSize: 12, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <button type="submit" style={{ padding: "6px 10px", background: "#4b5563", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Post</button>
          </form>
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
  countdownBox: { marginTop: 8, padding: "8px", background: "#fef2f2", color: "#991b1b", borderRadius: 6, fontSize: 12, textAlign: "center", border: "1px solid #fecaca" },
  actions: { display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee", flexWrap: "wrap" },
  returnBtn: { flex: 1, padding: "6px", background: "#10b981", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  deleteBtn: { flex: 1, padding: "6px", background: "#ef4444", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  claimBtn: { flex: 1, padding: "8px", background: "#2563eb", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: "bold" },
  textarea: { padding: 8, borderRadius: 4, border: "1px solid #ccc", fontSize: 12, fontFamily: "inherit" },
  sendBtn: { flex: 1, padding: "6px", background: "#2563eb", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  cancelBtn: { flex: 1, padding: "6px", background: "#e5e7eb", color: "#111", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
};