import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Campus Lost & Found</Link>
      <div style={styles.links}>
        <Link to="/blockchain" style={styles.link}>Blockchain</Link>
        
        {/* Admin Portal Link */}
        <a href="https://campus-lost-found-admin.vercel.app/" target="_blank" rel="noopener noreferrer" style={styles.link}>
          Admin Portal
        </a>

        {user ? (
          <>
            <Link to="/post-lost" style={styles.link}>Report Lost</Link>
            <Link to="/post-found" style={styles.link}>Report Found</Link>
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 24px", background: "#111827", color: "white" },
  brand: { color: "white", fontWeight: "bold", fontSize: 18, textDecoration: "none" },
  links: { display: "flex", gap: 16, alignItems: "center" },
  link: { color: "#e5e7eb", textDecoration: "none", fontSize: 15 },
  logout: { padding: "6px 12px", borderRadius: 6, border: "none",
    background: "#dc2626", color: "white", cursor: "pointer" },
};