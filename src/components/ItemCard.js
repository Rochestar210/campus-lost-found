export default function ItemCard({ item }) {
  const isLost = item.type === "lost";
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
      <p style={styles.status}>Status: {item.status}</p>
    </div>
  );
}

const styles = {
  card: { background: "white", borderRadius: 10, padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 6 },
  badge: { alignSelf: "flex-start", color: "white", fontSize: 11, fontWeight: "bold",
    padding: "3px 8px", borderRadius: 4 },
  title: { fontSize: 16, marginTop: 4 },
  desc: { fontSize: 14, color: "#555" },
  meta: { fontSize: 13, color: "#777" },
  status: { fontSize: 12, marginTop: 6, color: "#2563eb", fontWeight: "bold" },
};