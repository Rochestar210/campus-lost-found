// simpleChain.js — a minimal simulated blockchain
// Each block stores a SHA-256 hash of its data + the previous block's hash,
// making tampering detectable (integrity) and the chain publicly viewable (transparency).

import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// --- SHA-256 using the browser's built-in crypto API ---
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Compute a deterministic hash for a block's contents ---
export async function computeBlockHash(index, timestamp, eventType, itemId, dataHash, previousHash) {
  const payload = `${index}|${timestamp}|${eventType}|${itemId}|${dataHash}|${previousHash}`;
  return await sha256(payload);
}

// --- Get the latest block from Firestore (or the genesis block) ---
export async function getLatestBlock() {
  const q = query(collection(db, "blockchainLog"), orderBy("index", "desc"));
  const snap = await getDocs(q);
  if (snap.empty) {
    const genesisTimestamp = "1970-01-01T00:00:00.000Z";
    const genesisDataHash = await sha256("GENESIS");
    const genesisHash = await computeBlockHash(0, genesisTimestamp, "GENESIS", "-", genesisDataHash, "0");
    return {
      index: 0,
      timestamp: genesisTimestamp,
      eventType: "GENESIS",
      itemId: "-",
      dataHash: genesisDataHash,
      previousHash: "0",
      hash: genesisHash,
    };
  }
  return snap.docs[0].data();
}

// --- Add a new block to the chain ---
// eventType: "FOUND_REPORTED" | "LOST_REPORTED" | "CLAIM_MADE" | "ITEM_RETURNED"
export async function addBlock({ eventType, itemId, data }) {
  const previous = await getLatestBlock();

  const index = previous.index + 1;
  const timestamp = new Date().toISOString();
  const dataHash = await sha256(JSON.stringify(data));

  const hash = await computeBlockHash(
    index,
    timestamp,
    eventType,
    itemId,
    dataHash,
    previous.hash
  );

  await addDoc(collection(db, "blockchainLog"), {
    index,
    timestamp,
    eventType,
    itemId,
    dataHash,
    previousHash: previous.hash,
    hash,
    createdAt: serverTimestamp(),
  });

  return { index, timestamp, eventType, itemId, dataHash, previousHash: previous.hash, hash };
}

// --- Fetch the whole chain (for the Explorer page) ---
export async function getChain() {
  const q = query(collection(db, "blockchainLog"), orderBy("index", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Validate the chain (detect tampering) ---
export async function validateChain() {
  const chain = await getChain();
  if (chain.length === 0) return { valid: true, message: "Empty chain" };

  const issues = [];
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const previous = chain[i - 1];

    if (current.previousHash !== previous.hash) {
      issues.push(`Block #${current.index}: previousHash mismatch`);
    }

    const recomputed = await computeBlockHash(
      current.index,
      current.timestamp,
      current.eventType,
      current.itemId,
      current.dataHash,
      current.previousHash
    );
    if (recomputed !== current.hash) {
      issues.push(`Block #${current.index}: hash mismatch (data tampered)`);
    }
  }

  return issues.length === 0
    ? { valid: true, message: `Chain valid (${chain.length} blocks)` }
    : { valid: false, message: "Chain INVALID", issues };
}