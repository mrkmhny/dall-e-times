export default function initFirebase() {
  initializeApp({
      credential: cert(JSON.parse(firestoreServiceAccount)),
    });
}