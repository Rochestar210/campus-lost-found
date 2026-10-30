import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div style={styles.container}>
      <h2>Browse Items</h2>
      <div style={styles.filters}>
        {["all", "lost", "found"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, background: filter === f ? "#2563eb" : "#e5e7eb",
              color: filter === f ? "white" : "#111" }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p style={{ marginTop: 20 }}>No items yet. Be the first to post!</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "30px auto", padding: 20 },
  filters: { display: "flex", gap: 10, marginTop: 16 },
  filterBtn: { padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16, marginTop: 20 },
};