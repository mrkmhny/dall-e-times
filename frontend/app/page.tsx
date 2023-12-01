// import Image from 'next/image'
// import InputEchoer from '@/components/inputEchoer'
import fetch from 'node-fetch';
import { addToQueue } from '@/helpers/addToQueue';

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const firestoreServiceAccount = {
  "type": "service_account",
  "project_id": "dall-e-times",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/dall-e-times-service-account%40dall-e-times.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}


if (admin.apps.length === 0) {
  initializeApp({
    credential: cert(firestoreServiceAccount)
  });
}

let headlines: any[] = []


async function getLatestNews() {
  const db = getFirestore();
    
  try {
      const docRef = db.collection('news');
      const news = await docRef.orderBy('__name__', "desc").limit(1).get()
      headlines = []
      news.forEach((doc: any) => {
        doc.get('results').forEach((result: any, index: any) => {
          if (index < 5) {
            headlines.push(result.title)
          }
        })
      })
      console.log('headlines', headlines)
  } catch (err) {
      console.error("Something bad happened:", err)
  }
}

async function getForwardedResponse(queueResponse: any) {
  try {
    const queueResponseUrl = `https://zeplo.to/requests/${queueResponse.id}/response.body?_token=${process.env.ZEPLO}`
    
    const queueForwardedRes = await fetch(queueResponseUrl)

    return queueForwardedRes.json()

  } catch (error) {
    console.log(error)
  }
}

async function getImgUrl() {

  const queueResponse = await addToQueue(headlines)

  console.log('queueResponse', queueResponse)
  
  const retries = 10

  let forwardedResponse
  for (let i = 0; i < retries; i++) {
    await new Promise(r => setTimeout(r, 10000));
    forwardedResponse = await getForwardedResponse(queueResponse)

    console.log('forwardedResponse', forwardedResponse)

    if (forwardedResponse?.data && forwardedResponse?.data[0].url) {
      break;
    }
  }

  console.log('forwardedResponse', forwardedResponse)
  return forwardedResponse
}

export default async function Home() {
  await getLatestNews()
  const data: any = await getImgUrl()
  console.log('data', data)
  const imgUrl = data.data[0].url
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      </div>
      <img src={imgUrl} />

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
      </div>
    </main>
  )
}
