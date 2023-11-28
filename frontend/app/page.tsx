// import Image from 'next/image'
// import InputEchoer from '@/components/inputEchoer'
import fetch from 'node-fetch';
import { addToQueue } from '@/helpers/addToQueue';

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

let firestoreServiceAccount = process.env.FIREBASE || '';
firestoreServiceAccount = firestoreServiceAccount ? firestoreServiceAccount.replace(/\\n/gm, "\n") : ''

if (admin.apps.length === 0) {
  // const firebase_private_key_b64 = Buffer.from(firestoreServiceAccount, 'base64');
  // const firebase_private_key = firebase_private_key_b64.toString('utf8');
  initializeApp({
    credential: cert(JSON.parse(firestoreServiceAccount))
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

// export async function addToQueue() {
//   const imgGenerationUrl = "https://api.openai.com/v1/images/generations"
//   const queueUrl = `https://zeplo.to/${imgGenerationUrl}?_token=${process.env.ZEPLO}`

//   const prompt = `A spectacular image that contains content from all of the following headlines: ${headlines}`

//   console.log('prompt:', prompt)

//   const queueRes = await fetch(queueUrl, { 
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.OPENAI}`
//     },
//     body: `{
//       "model": "dall-e-3",
//       "prompt": "${prompt}",
//       "n": 1,
//       "size": "1024x1024"
//     }`
//   })

//   return queueRes.json()
  
// }

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
  // await new Promise(r => setTimeout(r, 10000));
  // return {
  //   created: 1700698167,
  //   data: [
  //     {
  //       revised_prompt: 'An adorable, small sea otter is seen floating on calm waters. The baby sea otter is wrapped in a kelp blanket, using it as an anchor to prevent drift while it sleeps. Its brown silky fur is sleek from the ocean water, eyes tightly shut and its limbs relaxed. The ocean around the otter is serene, with the sun above casting a gentle light on the scene. Tufts of green seaweed float nearby, creating a peaceful corner for the otter in the vast expanse of the ocean.',
  //       url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-q33OnJsH6ZZgV1M9jSdV55KD/user-c2Zx6jndCIkB0w8tpofHwvZQ/img-dP9tU3CDfgD68ePQYHI7DQ4V.png?st=2023-11-22T23%3A09%3A27Z&se=2023-11-23T01%3A09%3A27Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-11-22T22%3A11%3A54Z&ske=2023-11-23T22%3A11%3A54Z&sks=b&skv=2021-08-06&sig=zd7bGp%2BrI08RXLQJZTj4FHrNQTHnjzE5naJzPZoEA18%3D'
  //     }
  //   ]
  // }

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
  console.log('imgUrl')
  // const imgUrl = "myimg"
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p> */}
        {/* <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div> */}
      </div>

      {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div> */}

      {/* <div>{data}</div> */}
      <img src={imgUrl} />


      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {/* <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a> */}
      </div>
    </main>
  )
}
