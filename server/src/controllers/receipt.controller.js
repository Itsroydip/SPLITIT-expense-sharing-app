import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const scanReceipt = async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No image provided' 
    })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // Read image as base64
    const imageData = fs.readFileSync(file.path)
    const base64Image = imageData.toString('base64')
    const mimeType = file.mimetype

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    }

    const prompt = `Extract expense data from this receipt image. 
Return ONLY valid JSON, no markdown, no explanation, no code blocks.
{
  "amount": <number, the final total amount paid>,
  "description": <string, merchant/restaurant/store name>,
  "category": <one of: food, transport, accommodation, entertainment, shopping, utilities, healthcare, other>,
  "date": <string YYYY-MM-DD format, or null if not visible>,
  "lineItems": <array of strings, individual items if visible, empty array if not>
}`

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    let text = response.text()

    // Cleanup in case Gemini wraps in markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const parsed = JSON.parse(text)

    // Cleanup uploaded file
    fs.unlinkSync(file.path)

    res.json({ 
      success: true, 
      data: parsed 
    })

  } catch (err) {
    // Cleanup file on error
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }

    console.error('Receipt scan error:', err)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to scan receipt',
      error: err.message 
    })
  }
}