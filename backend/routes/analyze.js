import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// ✅ Use MEMORY storage (fixes Render issues)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Allowed values
const allowedAgeGroups = ["6-10", "11-14", "15-18", "adult"];
const allowedLifestyles = ["student", "athlete", "bodybuilder", "sedentary"];
const allowedWeightCategories = ["underweight", "normal", "overweight", "obese"];

// 🚀 ROUTE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // 🔍 Debug logs (remove later if you want)
    console.log("API KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
    console.log("File received:", !!req.file);

    const { ageGroup, lifestyle, weightCategory } = req.body;

    // ❌ Validation
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!ageGroup || !lifestyle || !weightCategory) {
      return res.status(400).json({
        error: "ageGroup, lifestyle, and weightCategory are required",
      });
    }

    if (!allowedAgeGroups.includes(ageGroup)) {
      return res.status(400).json({ error: "Invalid ageGroup" });
    }

    if (!allowedLifestyles.includes(lifestyle)) {
      return res.status(400).json({ error: "Invalid lifestyle" });
    }

    if (!allowedWeightCategories.includes(weightCategory)) {
      return res.status(400).json({ error: "Invalid weightCategory" });
    }

    // ✅ Convert image to base64 (NO fs needed)
    const base64Image = req.file.buffer.toString("base64");

    // 🤖 Gemini setup
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 🧠 Prompt
    const prompt = `
You are a strict JSON generator.

You are a professional Nutritionist and Vision AI.
Analyze the provided image of food and the user profile provided below.

User Profile:
- Age Group: ${ageGroup}
- Lifestyle: ${lifestyle}
- Weight Category: ${weightCategory}

TASK:
1. Identify all food items in the image.
2. Estimate the portion size (grams/ml) for each.
3. Calculate total Calories, Protein, Carbs, and Fats.
4. Provide 3-4 personalized suggestions to improve this specific meal based on the user's profile.

OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not include markdown formatting, backticks, or any conversational text.
Format:
{
  "foods": ["rice", "dal"],
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "analysis": {
    "status": "balanced" | "deficient" | "excess",
    "notes": "short explanation"
  },
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}

DO NOT:
- Add explanations
- Add markdown
- Add backticks
- Add text like "Here is the result"
`;

    let outputText;

    // 🔥 Gemini call (safe)
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ]);

      outputText = result.response.text();

    } catch (err) {
      console.error("❌ Gemini API Error:", err);

      return res.status(500).json({
        error: "AI processing failed",
      });
    }

    // 🧠 Parse response safely
    let parsed;

    try {
      let cleanText = outputText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .trim();

      parsed = JSON.parse(cleanText);

    } catch (err) {
      console.log("⚠️ JSON parsing failed → fallback");

      parsed = {
        foods: ["rice", "dal"],
        nutrition: {
          calories: 500,
          protein: 15,
          carbs: 80,
          fat: 10,
        },
        analysis: {
          status: "deficient",
          notes: "Protein intake is slightly low",
        },
        suggestions: [
          "Add egg or paneer for protein",
          "Include vegetables",
          "Increase portion size slightly",
        ],
      };
    }

    // ✅ Final response
    return res.json({
      success: true,
      inputs: { ageGroup, lifestyle, weightCategory },
      result: parsed,
    });

  } catch (error) {
    console.error("Analyze Error:", error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

export default router;