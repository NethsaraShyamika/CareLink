// controllers/symptomController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SymptomCheck = require("../models/SymptomCheck");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ----------------- POST /api/symptoms/check -----------------
const checkSymptoms = async (req, res) => {
  try {
    const { symptoms, additionalNotes, age, gender } = req.body;
    const patientId = req.user.id || req.user.userId;

    // Validate symptoms
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one symptom." });
    }

    // Validate age
    if (age && (age < 0 || age > 120)) {
      return res.status(400).json({ message: "Invalid age provided." });
    }

    // Validate gender
    const validGenders = ["male", "female", "other", "prefer_not_to_say"];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender provided." });
    }

    // Build AI prompt
    const patientContext = [];
    if (age) patientContext.push(`Age: ${age}`);
    if (gender) patientContext.push(`Gender: ${gender}`);
    if (additionalNotes) patientContext.push(`Additional notes: ${additionalNotes}`);

    const prompt = `You are a medical assistant AI for a telemedicine platform in Sri Lanka. 
A patient has reported the following symptoms: ${symptoms.join(", ")}.
${patientContext.length > 0 ? "Patient context: " + patientContext.join(", ") + "." : ""}

Provide a structured JSON response ONLY in the format:
{
  "possibleConditions": [
    {
      "name": "condition name",
      "description": "brief 1-2 sentence description",
      "severity": "low|moderate|high"
    }
  ],
  "recommendedSpecialties": ["specialty1", "specialty2"],
  "urgencyLevel": "routine|soon|urgent|emergency",
  "generalAdvice": "brief practical advice for the patient",
  "disclaimer": "This is a preliminary AI assessment only. Please consult a qualified doctor for proper diagnosis and treatment."
}`;

    // Call Gemini AI
    let aiResponse;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
        
      aiResponse = JSON.parse(cleaned);
    } catch (apiError) {
      console.warn("Gemini API skipped/failed. Falling back to Mock AI logic:", apiError.message);
      
      aiResponse = {
        possibleConditions: [
          {
            name: "Viral Infection",
            description: "A common viral illness matching your described symptoms.",
            severity: "moderate"
          },
          {
            name: "Stress/Fatigue Syndrome",
            description: "Physical manifestation of overexertion or mental stress.",
            severity: "low"
          }
        ],
        recommendedSpecialties: ["General Physician", "Neurologist"],
        urgencyLevel: "soon",
        generalAdvice: "Please rest, stay hydrated, and monitor your symptoms. If they worsen abruptly, seek immediate care.",
        disclaimer: "This is a preliminary AI assessment (Mock Fallback Mode). Please consult a qualified doctor for proper diagnosis."
      };
    }

    // Save to DB
    const symptomCheck = new SymptomCheck({
      patientId,
      symptoms,
      additionalNotes: additionalNotes || "",
      age,
      gender,
      aiResponse,
    });

    await symptomCheck.save();

    res.status(201).json({
      success: true,
      checkId: symptomCheck._id,
      symptoms,
      aiResponse,
      createdAt: symptomCheck.createdAt,
    });
  } catch (err) {
    console.error("Symptom check error:", err);
    res.status(500).json({ message: "AI service error: " + err.message, stack: err.stack });
  }
};

// ----------------- GET /api/symptoms/history -----------------
const getHistory = async (userId) => {
  try {
    const checks = await SymptomCheck.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-__v");
    return checks;
  } catch (err) {
    console.error("Fetch history error:", err);
    throw new Error("Failed to fetch history.");
  }
};

const getHistoryRoute = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const history = await getHistory(userId);
    res.status(200).json({ success: true, count: history.length, checks: history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- GET /api/symptoms/:id -----------------
const getCheckById = async (req, res) => {
  try {
    const check = await SymptomCheck.findById(req.params.id);
    if (!check) return res.status(404).json({ message: "Record not found." });

    const userId = req.user.id || req.user.userId;
    if (req.user.role === "patient" && check.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({ success: true, check });
  } catch (err) {
    console.error("Fetch record error:", err);
    res.status(500).json({ message: "Failed to fetch record." });
  }
};

module.exports = { checkSymptoms, getHistoryRoute, getCheckById };