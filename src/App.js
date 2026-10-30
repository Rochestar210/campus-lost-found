import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostLost from "./pages/PostLost";
import PostFound from "./pages/PostFound";
import BlockchainExplorer from "./pages/BlockchainExplorer";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <BrowserRouter>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/blockchain" element={<BlockchainExplorer />} />
        <Route path="/post-lost" element={
          <ProtectedRoute user={user}><PostLost /></ProtectedRoute>
        } />
        <Route path="/post-found" element={
          <ProtectedRoute user={user}><PostFound /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}