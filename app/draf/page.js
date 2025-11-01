"use client";
import { useEffect, useState } from "react";
import { getDB } from "../../lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

export default function DrafPage() {
  const [berita, setBerita] = useState([]);
  const db = getDB();

  useEffect(() => {
    const beritaRef = ref(db, "berita");

    const unsubscribe = onValue(beritaRef, (snapshot) => {
      const list = [];
      snapshot.forEach((child) => {
        const data = child.val();
        const id = child.key;

        if ((data.status || "").toLowerCase() === "pending") {
          list.push({ id, ...data });
        }
      });
      setBerita(list);
    });

    return () => unsubscribe();
  }, [db]);

  // 🔹 Fungsi Setujui & Tolak
  const setujui = async (id) => {
    await update(ref(db, "berita/" + id), { status: "approved" });
  };

  const tolak = async (id) => {
    await remove(ref(db, "berita/" + id));
  };

  return (
    <main style={{ padding: "20px" }}>
      <h2>📌 Draf Berita (Menunggu Persetujuan)</h2>

      {berita.length === 0 ? (
        <p>Tidak ada berita pending.</p>
      ) : (
        berita.map((b) => (
          <div
            key={b.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>{b.judul || "Tanpa Judul"}</h3>

            {/* ✅ Link dalam isi berita jadi aktif */}
            <div
              dangerouslySetInnerHTML={{
                __html: (b.isi || "")
                  .replace(
                    /(https?:\/\/[^\s]+)/g,
                    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>'
                  )
                  .replace(/\n/g, "<br />"),
              }}
            />

            {b.fileURL && (
              <img
                src={b.fileURL}
                alt={b.judul}
                style={{ maxWidth: "200px", borderRadius: "5px" }}
              />
            )}
            <p>
              <small>{b.tanggal || ""}</small>
            </p>
            <p>
              <b>Status:</b> {b.status}
            </p>
            <button
              onClick={() => setujui(b.id)}
              style={{
                marginRight: "10px",
                background: "green",
                color: "white",
              }}
            >
              Setujui
            </button>
            <button
              onClick={() => tolak(b.id)}
              style={{ background: "red", color: "white" }}
            >
              Tolak
            </button>
          </div>
        ))
      )}
    </main>
  );
}
