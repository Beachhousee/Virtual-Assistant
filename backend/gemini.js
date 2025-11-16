import axios from 'axios'
const geminiResponse= async(prompt,assistantName,userName)=>{
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const result = await axios.post(apiUrl,{
        "contents": [
      {
        "parts": [
          {
            "text":prompt
          }
        ]
      }]
    })
    return result.data.candidates[0].content.parts[0].text
  } catch (error) {
    console.log(error)
  }
}
export default geminiResponse;
