import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // NEW: Search state

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Filter logic combining the LOST/FOUND buttons AND the Search Bar
  const filtered = items.filter((item) => {
    // 1. Check if it matches the ALL/LOST/FOUND button
    const matchesFilter = filter === "all" || item.type === filter;
    
    // 2. Check if it matches the search term (searches title, desc, location, category)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h2>Browse Items</h2>
        
        {/* NEW: Search Bar */}
        <input 
          type="text" 
          placeholder="🔍 Search by title, location, or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBar}
        />
      </div>

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
        <p style={{ marginTop: 20 }}>No items found matching your search.</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} currentUser={auth.currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "30px auto", padding: 20 },
  headerArea: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  searchBar: { padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, width: "100%", maxWidth: 400 },
  filters: { display: "flex", gap: 10, marginTop: 16 },
  filterBtn: { padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16, marginTop: 20 },
};