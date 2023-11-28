export async function addToQueue(headlines: any) {
    const imgGenerationUrl = "https://api.openai.com/v1/images/generations"
    const queueUrl = `https://zeplo.to/${imgGenerationUrl}?_token=${process.env.ZEPLO}`
  
    const prompt = `A spectacular collage that contains content from all of the following headlines: ${headlines}`
  
    console.log('prompt:', prompt)
  
    const queueRes = await fetch(queueUrl, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI}`
      },
      body: `{
        "model": "dall-e-3",
        "prompt": "${prompt}",
        "n": 1,
        "size": "1024x1024"
      }`
    })
  
    return queueRes.json()
    
  }