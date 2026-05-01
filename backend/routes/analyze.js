import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// ✅ Memory storage (no filesystem issues on Render)
const upload = multer({ storage: multer.memoryStorage() });

// Allowed values
const allowedAgeGroups = ["6-10", "11-14", "15-18", "adult"];
const allowedLifestyles = ["student", "athlete", "bodybuilder", "sedentary"];
const allowedWeightCategories = ["underweight", "normal", "overweight", "obese"];

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("=== REQUEST START ===");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file ? "YES" : "NO");

    const { ageGroup, lifestyle, weightCategory } = req.body;

    // ✅ Validate file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: "Image upload failed (no file received)",
      });
    }

    // ✅ Validate inputs (optional strict)
    if (
      !allowedAgeGroups.includes(ageGroup) ||
      !allowedLifestyles.includes(lifestyle) ||
      !allowedWeightCategories.includes(weightCategory)
    ) {
      console.log("⚠️ Invalid input values — continuing anyway");
    }

    // ✅ Convert image to base64
    const base64Image = req.file.buffer.toString("base64");

    // ✅ Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing");

      return res.json({
        success: true,
        result: fallbackResponse("API key missing"),
      });
    }

    // ✅ Gemini setup
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

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
  "foods": ["item1", "item2"],
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
    let outputText = "";

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype || "image/jpeg",
          },
        },
      ]);

      outputText = result?.response?.text() || "";

      console.log("RAW AI OUTPUT:", outputText);

    } catch (err) {
      console.error("❌ Gemini Error:", err);

      return res.json({
        success: true,
        result: fallbackResponse("AI failed"),
      });
    }

    // ✅ Parse safely
    let parsed;

    try {
      const cleanText = outputText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .trim();

      parsed = JSON.parse(cleanText);

    } catch (err) {
      console.log("⚠️ JSON parse failed");

      parsed = fallbackResponse("Parse failed");
    }

    return res.json({
      success: true,
      inputs: { ageGroup, lifestyle, weightCategory },
      result: parsed,
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);

    return res.json({
      success: true,
      result: fallbackResponse("Server error"),
    });
  }
});

// ✅ Fallback generator
function fallbackResponse(reason = "") {
  return {
    foods: ["rice", "dal"],
    nutrition: {
      calories: 500,
      protein: 15,
      carbs: 80,
      fat: 10,
    },
    analysis: {
      status: "deficient",
      notes: `Fallback used (${reason})`,
    },
    suggestions: [
      "Add protein source (egg/paneer)",
      "Include vegetables",
      "Increase meal portion slightly",
    ],
  };
}

export default router;