import { useEffect, useState } from "react";
import { getChain, validateChain } from "../blockchain/simpleChain";

export default function BlockchainExplorer() {
  const [chain, setChain] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChain = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getChain();
      setChain(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleValidate = async () => {
    const result = await validateChain();
    setValidation(result);
  };

  useEffect(() => {
    loadChain();
  }, []);

  return (
    <div style={styles.container}>
      <h2>⛓️ Blockchain Explorer</h2>
      <p style={styles.subtitle}>
        Immutable audit trail of all item events. Each block is hash-chained to the previous one — tampering is detectable.
      </p>

      <div style={styles.actions}>
        <button style={styles.button} onClick={loadChain}>🔄 Refresh</button>
        <button style={{ ...styles.button, background: "#7c3aed" }} onClick={handleValidate}>
          ✅ Validate Chain
        </button>
      </div>

      {validation && (
        <div style={{
          ...styles.validationBox,
          background: validation.valid ? "#dcfce7" : "#fee2e2",
          color: validation.valid ? "#166534" : "#991b1b",
        }}>
          <strong>{validation.valid ? "✅ " : "❌ "}{validation.message}</strong>
          {validation.issues && (
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {validation.issues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
          )}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading chain…</p>}

      {!loading && chain.length === 0 && (
        <p style={{ marginTop: 20 }}>No blocks yet. Post a lost or found item to create the first block!</p>
      )}

      {!loading && chain.length > 0 && (
        <div style={styles.chain}>
          {chain.map((block) => (
            <div key={block.id || block.index} style={styles.block}>
              <div style={styles.blockHeader}>
                <span style={styles.blockIndex}>Block #{block.index}</span>
                <span style={styles.eventBadge}>{block.eventType}</span>
              </div>
              <div style={styles.blockBody}>
                <p><strong>Timestamp:</strong> {block.timestamp}</p>
                <p><strong>Item ID:</strong> {block.itemId}</p>
                <p><strong>Data Hash:</strong> <code style={styles.code}>{block.dataHash}</code></p>
                <p><strong>Previous Hash:</strong> <code style={styles.code}>{block.previousHash}</code></p>
                <p><strong>This Block Hash:</strong> <code style={styles.code}>{block.hash}</code></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "30px auto", padding: 20 },
  subtitle: { color: "#555", marginTop: 8, marginBottom: 16 },
  actions: { display: "flex", gap: 10, marginBottom: 20 },
  button: { padding: "10px 16px", borderRadius: 6, border: "none",
    background: "#2563eb", color: "white", cursor: "pointer", fontSize: 14 },
  validationBox: { padding: 14, borderRadius: 8, marginBottom: 20 },
  chain: { display: "flex", flexDirection: "column", gap: 16 },
  block: { background: "white", borderRadius: 10, padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: "5px solid #7c3aed" },
  blockHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  blockIndex: { fontWeight: "bold", fontSize: 16, color: "#7c3aed" },
  eventBadge: { background: "#ede9fe", color: "#5b21b6", fontSize: 12,
    fontWeight: "bold", padding: "4px 10px", borderRadius: 4 },
  blockBody: { fontSize: 13, color: "#333", display: "flex", flexDirection: "column", gap: 4 },
  code: { fontFamily: "monospace", fontSize: 11, color: "#444",
    wordBreak: "break-all", background: "#f3f4f6", padding: "2px 6px", borderRadius: 3 },
};