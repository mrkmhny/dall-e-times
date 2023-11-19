const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const fetch = require('node-fetch');

const firestoreServiceAccount = require('../private/dall-e-times.json');
const newsIoAccount = require('../private/newsdata-io.json');

initializeApp({
  credential: cert(firestoreServiceAccount),
});

async function main() {
    
    const db = getFirestore();
    
    try {
        const date = new Date()

        const recentNewsRes = await fetch(`https://newsdata.io/api/1/news?apikey=${newsIoAccount.apiKey}&category=science&country=us`)
        const recentNewsData = await recentNewsRes.json()

        const docRef = db.collection('news').doc(date.getTime().toString());
        await docRef.set(recentNewsData);
    } catch (err) {
        console.error("Something bad happened:", err)
    }
}

main();