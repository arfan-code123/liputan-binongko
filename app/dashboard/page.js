"use client";

import "../../styles/dashboard.css";
import { useState, useEffect } from "react";
// Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signOut
} from "firebase/auth";
import {
  getDatabase, ref, push, set, onValue, remove, update
} from "firebase/database";

// 🔹 Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHYqB77kPPJcoNfW8APKUQoh066eMGipA",
  authDomain: "portal-binongko-dad4d.firebaseapp.com",
  databaseURL: "https://portal-binongko-dad4d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portal-binongko-dad4d",
  storageBucket: "portal-binongko-dad4d.appspot.com",
  messagingSenderId: "582358308032",
  appId: "1:582358308032:web:9d36c636adec204ab24925"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [file, setFile] = useState(null);
  const [beritaSaya, setBeritaSaya] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editJudul, setEditJudul] = useState("");
  const [editIsi, setEditIsi] = useState("");
  const [showModal, setShowModal] = useState(false);

  const cloudName = "ddy15mvkg";
  const uploadPreset = "portal_berita";

  // 🔹 cek login
  useEffect(() => {
    onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setUser(usr);
        loadBerita(usr.uid);
      } else {
        setUser(null);
      }
    });
  }, []);

  // 🔹 load berita
  function loadBerita(uid) {
    const beritaRef = ref(db, "berita");
    onValue(beritaRef, (snapshot) => {
      const arr = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.penulisId === uid) {
          arr.push({ id: child.key, ...data });
        }
      });
      setBeritaSaya(arr);
    });
  }

  // 🔹 upload berita
  async function handleUpload(e) {
    e.preventDefault();
    if (!user) return alert("Harus login dulu!");

    let fileURL = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      fileURL = data.secure_url || "";
    }

    // 🔹 buat slug otomatis dari judul
    const slug = judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newRef = push(ref(db, "berita"));
    await set(newRef, {
      judul,
      slug,
      isi,
      fileURL,
      tanggal: new Date().toISOString(),
      kategori: "umum",
      penulisId: user.uid,
      penulisEmail: user.email,
      status: "pending"
    });

    setJudul("");
    setIsi("");
    setFile(null);
    alert("Berita berhasil dikirim!");
  }

  // 🔹 hapus
  function hapusBerita(id) {
    if (confirm("Yakin hapus berita ini?")) {
      remove(ref(db, "berita/" + id));
    }
  }

  // 🔹 edit
  function bukaEdit(b) {
    setEditId(b.id);
    setEditJudul(b.judul);
    setEditIsi(b.isi);
    setShowModal(true);
  }

  function simpanEdit() {
    if (editId) {
      // 🔹 perbarui juga slug ketika judul berubah
      const newSlug = editJudul
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      update(ref(db, "berita/" + editId), {
        judul: editJudul,
        slug: newSlug,
        isi: editIsi,
        status: "pending"
      });
      setShowModal(false);
      setEditId(null);
    }
  }

  function logout() {
    signOut(auth).then(() => window.location.href = "/login");
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard Wartawan</h1>
        <div className="auth-buttons">
          <a href="/">Beranda</a>
          <a href="/profil">Profil</a>
          <a href="/kontak">Kontak</a>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        <div className="status">
          {user ? `Login sebagai: ${user.email}` : "Anda belum login."}
        </div>

        {user && (
          <form onSubmit={handleUpload} className="uploadForm">
            <input
              type="text"
              placeholder="Judul Berita"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
            <textarea
              placeholder="Isi Berita"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit">Upload Berita</button>
          </form>
        )}

        <h2>Berita Saya</h2>
        <div className="beritaSaya">
          {beritaSaya.map((b) => (
            <div key={b.id} className="berita-item">
              <h3>{b.judul}</h3>
              <p>{b.isi}</p>
              {b.fileURL && <img src={b.fileURL} width="200" />}
              <p><small>{new Date(b.tanggal).toLocaleString()}</small></p>
              <p><b>Status:</b> {b.status}</p>
              <button onClick={() => bukaEdit(b)}>Edit</button>
              <button onClick={() => hapusBerita(b.id)}>Hapus</button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal edit */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Berita</h2>
            <input
              type="text"
              value={editJudul}
              onChange={(e) => setEditJudul(e.target.value)}
            />
            <textarea
              value={editIsi}
              onChange={(e) => setEditIsi(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={simpanEdit}>Simpan</button>
              <button onClick={() => setShowModal(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
