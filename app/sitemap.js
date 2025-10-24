import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCHYqB77kPPJcoNfW8APKUQoh066eMGipA",
  authDomain: "portal-binongko-dad4d.firebaseapp.com",
  databaseURL: "https://portal-binongko-dad4d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portal-binongko-dad4d",
  storageBucket: "portal-binongko-dad4d.appspot.com",
  messagingSenderId: "582358308032",
  appId: "1:582358308032:web:9d36c636adec204ab24925",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export default async function sitemap() {
  const baseUrl = "https://liputan-binongko-three.vercel.app";
  let urls = [];

  try {
    const beritaRef = ref(database, "berita");
    const snapshot = await get(beritaRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const item = data[key];
        if (item.status === "approved") {
          urls.push({
            url: `${baseUrl}/berita/${key}`,
            lastModified: new Date(item.tanggal || Date.now()),
            changeFrequency: "daily",
            priority: 0.8,
          });
        }
      });
    }
  } catch (err) {
    console.error("Firebase Error:", err);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...urls,
  ];
}
