import { notFound } from "next/navigation";
import { ref, get, set } from "firebase/database";
import { getDB } from "../../../lib/firebase";
import Header from "../../components/Header";
import ShareButtons from "../../../components/ShareButtons";

// 🔹 Format paragraf agar rapi
function formatParagraf(teks) {
  if (!teks) return "";
  return teks
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p, i) => <p key={i}>{p.trim()}</p>);
}

// 🔹 Fungsi bantu: ubah judul jadi slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// 🔹 Metadata dinamis (SEO & preview sosial)
export async function generateMetadata({ params }) {
  const { slug } = params;
  const db = getDB();
  const beritaRef = ref(db, "berita");
  const snapshot = await get(beritaRef);

  if (!snapshot.exists()) {
    return { title: "Berita Tidak Ditemukan - Liputan Binongko" };
  }

  const semua = Object.entries(snapshot.val()).map(([key, val]) => ({
    id: key,
    ...val,
  }));

  const berita = semua.find((b) => slugify(b.judul) === slug);

  if (!berita) {
    return { title: "Berita Tidak Ditemukan - Liputan Binongko" };
  }

  const fullUrl = `https://liputan-binongko-three.vercel.app/berita/${slug}`;
  const imageUrl =
    berita.fileURL || "https://liputan-binongko-three.vercel.app/default.jpg";
  const deskripsi =
    berita.isi?.slice(0, 150) || "Berita terkini dari Binongko, Wakatobi.";

  return {
    metadataBase: new URL("https://liputan-binongko-three.vercel.app"),
    title: `${berita.judul} - Liputan Binongko`,
    description: deskripsi,
    openGraph: {
      title: berita.judul,
      description: deskripsi,
      url: fullUrl,
      siteName: "Liputan Binongko",
      type: "article",
      locale: "id_ID",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: berita.judul,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: berita.judul,
      description: deskripsi,
      images: [imageUrl],
      site: "@LiputanBinongko",
      creator: "@LiputanBinongko",
    },
  };
}

// 🔹 Halaman detail berita berdasarkan slug
export default async function BeritaSlugPage({ params }) {
  const { slug } = params;
  const db = getDB();
  const semuaRef = ref(db, "berita");
  const semuaSnap = await get(semuaRef);

  if (!semuaSnap.exists()) notFound();

  const semua = Object.entries(semuaSnap.val()).map(([key, val]) => ({
    id: key,
    ...val,
  }));

  const data = semua.find((b) => slugify(b.judul) === slug);

  if (!data) notFound();

  // ✅ Update jumlah views
  const currentViews = data.views || 0;
  await set(ref(db, `berita/${data.id}/views`), currentViews + 1);

  // 🔹 Berita populer & lainnya
  const populer = semua
    .filter((b) => b.status === "approved")
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const lainnya = semua
    .filter((b) => b.id !== data.id && b.status === "approved")
    .sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0))
    .slice(0, 5);

  return (
    <>
      {/* ✅ Header Reusable */}
      <Header />

      <main>
        {/* 🔹 Isi Berita */}
        <section id="berita-detail" className="berita-detail">
          <h2 style={{ fontWeight: "bold", color: "black" }}>{data.judul}</h2>

          <div className="views-info">
            {data.tanggal && <span>Tanggal: {data.tanggal}</span>}{" "}
            {data.penulis && <span> | Penulis: {data.penulis}</span>}{" "}
            <span> | {currentViews + 1}x dilihat</span>
          </div>

          {data.fileURL && (
            <img
              src={data.fileURL}
              alt={data.judul}
              id="detail-berita-img"
            />
          )}

          <article id="isi" className="leading-relaxed">
            {formatParagraf(data.isi)}
          </article>

          <ShareButtons judul={data.judul} />
        </section>

        {/* 🔹 Berita Populer */}
        <section id="berita-populer">
          <h2 className="Berita-Populer">Berita Populer</h2>
          <div id="berita-populer-list">
            {populer.map((b) => (
              <div key={b.id} className="berita-populer-item">
                <a href={`/berita/${slugify(b.judul)}`} className="berita-card-title">
                  {b.judul}
                </a>
                <p className="views-info">({b.views || 0}x dilihat)</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 Berita Lainnya */}
        <section id="berita-lainnya">
          <h2 className="Berita-Lainnya">Berita Lainnya</h2>
          <div id="berita-lainnya-list">
            {lainnya.map((b) => (
              <div key={b.id} className="berita-lainnya-card">
                <a href={`/berita/${slugify(b.judul)}`} className="berita-card-title">
                  {b.judul}
                </a>
                <p className="views-info">({b.views || 0}x dilihat)</p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Footer */}
        <footer>
          <p>&copy; 2025 - Liputan Binongko. Semua Hak Dilindungi.</p>
        </footer>
      </main>
    </>
  );
}
