import Image from "next/image";
import { getDatabase, ref, get, child } from "firebase/database";
import { initializeApp } from "firebase/app";

// ✅ Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHYqB77kPPJcoNfW8APKUQoh066eMGipA",
  authDomain: "portal-binongko-dad4d.firebaseapp.com",
  databaseURL:
    "https://portal-binongko-dad4d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portal-binongko-dad4d",
  storageBucket: "portal-binongko-dad4d.appspot.com",
  messagingSenderId: "582358308032",
  appId: "1:582358308032:web:9d36c636adec204ab24925",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const baseUrl = "https://liputan-binongko-three.vercel.app";

// ✅ Fungsi ubah link jadi aktif
function formatLinks(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${url}</a>`
  );
}

// 🔹 Metadata dinamis (SEO + Open Graph)
export async function generateMetadata({ params }) {
  const { id } = params;

  const snapshot = await get(child(ref(db), `berita/${id}`));
  if (!snapshot.exists()) {
    return {
      title: "Berita tidak ditemukan | Liputan Binongko",
      description: "Halaman berita ini tidak ditemukan di Liputan Binongko.",
    };
  }

  const data = snapshot.val();
  const imageUrl = data.gambar || data.fileURL || "/fallback-image.jpg";
  const isiPendek = data.isi
    ? data.isi.substring(0, 150) + "..."
    : "Berita terbaru dari Pulau Binongko, Wakatobi.";

  return {
    title: `${data.judul} | Liputan Binongko`,
    description: isiPendek,
    openGraph: {
      title: `${data.judul} | Liputan Binongko`,
      description: isiPendek,
      images: [imageUrl],
      url: `${baseUrl}/berita/${id}`,
      type: "article",
      siteName: "Liputan Binongko",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.judul} | Liputan Binongko`,
      description: isiPendek,
      images: [imageUrl],
    },
  };
}

// 🔹 Halaman detail berita
export default async function BeritaDetailPage({ params }) {
  const { id } = params;

  const snapshot = await get(child(ref(db), `berita/${id}`));
  if (!snapshot.exists()) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Berita tidak ditemukan</h1>
        <p>Periksa kembali link atau ID berita yang kamu buka.</p>
      </div>
    );
  }

  const data = snapshot.val();

  // ✅ Ubah teks isi berita jadi HTML dengan link aktif dan baris baru
  const isiDenganLink = formatLinks(data.isi).replace(/\n/g, "<br />");

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">{data.judul}</h1>

      {(data.gambar || data.fileURL) ? (
        <Image
          src={data.gambar || data.fileURL}
          alt={data.judul || "Berita dari Liputan Binongko"}
          width={900}
          height={480}
          className="rounded-lg mb-6 object-cover"
          priority
        />
      ) : (
        <p className="text-gray-500 mb-4">Tidak ada gambar</p>
      )}

      {/* ✅ Sekarang link akan aktif, biru, dan bisa diklik */}
      <article
        className="prose prose-lg text-gray-800 leading-relaxed whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: isiDenganLink }}
      />
    </div>
  );
}
