"use client";

import "../../styles/list.css"; // ✅ tambahkan ini
import { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { getDB } from "../../lib/firebase"; // ✅ sama seperti page.js

export default function ListBeritaPage() {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState(null);
  const [editForm, setEditForm] = useState({ judul: "", isi: "", file: null });

  // 🔹 Load semua berita saat komponen mount
  useEffect(() => {
    setLoading(true);
    const db = getDB(); // ✅ ambil database dari fungsi, bukan variabel langsung
    const beritaRef = ref(db, "berita");

    const unsubscribe = onValue(
      beritaRef,
      (snapshot) => {
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
      },
      (error) => {
        console.error("Firebase Error:", error);
        setLoading(false);
      }
    );

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
    setEditForm({ judul: item.judul || "", isi: item.isi || "", file: null });
  };

  // 🔹 Batalkan edit
  const batalkanEdit = () => {
    setEditKey(null);
    setEditForm({ judul: "", isi: "", file: null });
  };

  // 🔹 Simpan hasil edit
  const simpanEdit = async (id, oldFileURL) => {
    const db = getDB();

    if (!editForm.judul || !editForm.isi) {
      alert("Judul dan isi tidak boleh kosong!");
      return;
    }

    let fileURL = oldFileURL || "";

    // Upload gambar baru ke Cloudinary (jika ada)
    if (editForm.file) {
      const cloudName = "ddy15mvkg"; // ganti sesuai akun Cloudinary kamu
      const uploadPreset = "portal_berita";

      const formData = new FormData();
      formData.append("file", editForm.file);
      formData.append("upload_preset", uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) fileURL = data.secure_url;
        else {
          alert("Gagal upload gambar");
          return;
        }
      } catch (err) {
        alert("Gagal upload gambar: " + err);
        return;
      }
    }

    // 🔹 Update ke Firebase
    update(ref(db, `berita/${id}`), {
      judul: editForm.judul,
      isi: editForm.isi,
      fileURL,
      updatedAt: Date.now(),
    })
      .then(() => {
        alert("Berita berhasil diperbarui");
        batalkanEdit();
      })
      .catch((err) => alert("Gagal update: " + err));
  };

  // 🔹 Tampilan halaman
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
                  simpanEdit(b.id, b.fileURL);
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                  style={{ marginBottom: "5px" }}
                />
                <div>
                  <button type="submit">Simpan</button>
                  <button type="button" onClick={batalkanEdit} style={{ marginLeft: "5px" }}>
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2>{b.judul || "Tanpa Judul"}</h2>
                {b.fileURL && (
                  <img
                    src={b.fileURL}
                    alt={b.judul}
                    style={{ maxWidth: "100%", height: "auto", marginTop: "10px" }}
                  />
                )}
                <p>{b.isi}</p>
                <small>
                  Diposting:{" "}
                  {b.tanggal
                    ? new Date(b.tanggal).toLocaleString("id-ID")
                    : "Baru saja"}
                </small>
                <div className="berita-actions" style={{ marginTop: "10px" }}>
                  <button onClick={() => mulaiEdit(b)}>Edit</button>
                  <button
                    onClick={() => hapusBerita(b.id, b.judul)}
                    style={{ marginLeft: "5px" }}
                  >
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
