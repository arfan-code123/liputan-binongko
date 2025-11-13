"use client";

import "../../styles/list.css";
import { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { getDB } from "../../lib/firebase";

export default function ListBeritaPage() {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState(null);
  const [editForm, setEditForm] = useState({
    judul: "",
    isi: "",
    file1: null,
    file2: null,
    file3: null,
  });

  const cloudName = "ddy15mvkg";
  const uploadPreset = "portal_berita";

  // 🔹 Load semua berita
  useEffect(() => {
    setLoading(true);
    const db = getDB();
    const beritaRef = ref(db, "berita");

    const unsubscribe = onValue(beritaRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBerita([]);
        setLoading(false);
        return;
      }
      const list = Object.entries(data)
        .sort((a, b) => (b[1].tanggal || 0) - (a[1].tanggal || 0))
        .map(([key, value]) => ({ id: key, ...value }));

      setBerita(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Hapus berita
  const hapusBerita = (id, judul) => {
    const db = getDB();
    if (confirm(`Hapus berita "${judul}"?`)) {
      remove(ref(db, `berita/${id}`))
        .then(() => alert("Berita berhasil dihapus"))
        .catch((err) => alert("Gagal hapus: " + err));
    }
  };

  // 🔹 Mulai edit
  const mulaiEdit = (item) => {
    setEditKey(item.id);
    setEditForm({
      judul: item.judul || "",
      isi: item.isi || "",
      file1: null,
      file2: null,
      file3: null,
    });
  };

  // 🔹 Batalkan edit
  const batalkanEdit = () => {
    setEditKey(null);
    setEditForm({
      judul: "",
      isi: "",
      file1: null,
      file2: null,
      file3: null,
    });
  };

  // 🔹 Upload ke Cloudinary
  async function uploadFile(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url || null;
  }

  // 🔹 Simpan hasil edit
  const simpanEdit = async (item) => {
    const db = getDB();
    if (!editForm.judul || !editForm.isi) {
      alert("Judul dan isi tidak boleh kosong!");
      return;
    }

    try {
      const [url1, url2, url3] = await Promise.all([
        editForm.file1 ? uploadFile(editForm.file1) : item.fileURL1 || item.fileURL || "",
        editForm.file2 ? uploadFile(editForm.file2) : item.fileURL2 || "",
        editForm.file3 ? uploadFile(editForm.file3) : item.fileURL3 || "",
      ]);

      await update(ref(db, `berita/${item.id}`), {
        judul: editForm.judul,
        isi: editForm.isi,
        fileURL1: url1,
        fileURL2: url2,
        fileURL3: url3,
        updatedAt: Date.now(),
      });

      alert("Berita berhasil diperbarui!");
      batalkanEdit();
    } catch (err) {
      alert("Gagal update berita: " + err);
    }
  };

  // 🔹 Tampilan
  return (
    <main style={{ padding: "20px" }}>
      <h1>Daftar Berita</h1>
      {loading && <div id="loading">Memuat berita...</div>}

      <div id="beritaContainer">
        {berita.length === 0 && !loading && <p>Belum ada berita.</p>}

        {berita.map((b) => (
          <div
            key={b.id}
            className="berita-card"
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            {editKey === b.id ? (
              <form
                className="edit-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  simpanEdit(b);
                }}
              >
                <input
                  type="text"
                  value={editForm.judul}
                  onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                  placeholder="Judul"
                  required
                  style={{ width: "100%", marginBottom: "5px", padding: "5px" }}
                />
                <textarea
                  rows={5}
                  value={editForm.isi}
                  onChange={(e) => setEditForm({ ...editForm, isi: e.target.value })}
                  placeholder="Isi berita"
                  required
                  style={{ width: "100%", marginBottom: "5px", padding: "5px" }}
                />

                <p><b>Ganti Gambar (opsional)</b></p>
                <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, file1: e.target.files[0] })} />
                <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, file2: e.target.files[0] })} />
                <input type="file" accept="image/*" onChange={(e) => setEditForm({ ...editForm, file3: e.target.files[0] })} />

                <div style={{ marginTop: "10px" }}>
                  <button type="submit">Simpan</button>
                  <button type="button" onClick={batalkanEdit} style={{ marginLeft: "5px" }}>
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2>{b.judul || "Tanpa Judul"}</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* ✅ tampilkan semua kemungkinan gambar */}
                  {b.fileURL && (
                    <img
                      src={b.fileURL}
                      alt="Gambar Utama"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  )}
                  {b.fileURL1 && (
                    <img
                      src={b.fileURL1}
                      alt="Gambar 1"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  )}
                  {b.fileURL2 && (
                    <img
                      src={b.fileURL2}
                      alt="Gambar 2"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  )}
                  {b.fileURL3 && (
                    <img
                      src={b.fileURL3}
                      alt="Gambar 3"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  )}
                </div>

                <p style={{ marginTop: "10px" }}>{b.isi}</p>
                <small>
                  Diposting:{" "}
                  {b.tanggal ? new Date(b.tanggal).toLocaleString("id-ID") : "Baru saja"}
                </small>
                <div className="berita-actions" style={{ marginTop: "10px" }}>
                  <button onClick={() => mulaiEdit(b)}>Edit</button>
                  <button onClick={() => hapusBerita(b.id, b.judul)} style={{ marginLeft: "5px" }}>
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
