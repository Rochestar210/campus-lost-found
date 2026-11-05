import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the logged-in user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Campus Lost & Found</Link>
      <div style={styles.links}>
        <Link to="/blockchain" style={styles.link}>Blockchain</Link>
        
        {/* Admin Portal - Only visible to Admins */}
        {isAdmin && (
          <a href="https://campus-lost-found-admin.vercel.app/" target="_blank" rel="noopener noreferrer" style={styles.adminLink}>
            🔒 Admin Portal
          </a>
        )}

        {/* AI Insights - Only visible to Admins */}
        {isAdmin && (
          <a href="https://lost-found.streamlit.app/" target="_blank" rel="noopener noreferrer" style={styles.aiLink}>
            🤖 AI Insights
          </a>
        )}

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
  adminLink: { color: "#fbbf24", textDecoration: "none", fontSize: 15, fontWeight: "bold" },
  aiLink: { color: "#a78bfa", textDecoration: "none", fontSize: 15, fontWeight: "bold" },
  logout: { padding: "6px 12px", borderRadius: 6, border: "none",
    background: "#dc2626", color: "white", cursor: "pointer" },
};