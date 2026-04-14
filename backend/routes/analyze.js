const express = require('express');
const { verifyToken } = require('./auth');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const formData = req.body;

  const systemPrompt = `You are an intelligent homeopathic analysis assistant trained on 
  classical homeopathic literature, especially Kent's Repertory of the 
  Homeopathic Materia Medica and Boericke's Materia Medica, along with 
  principles from Organon of Medicine. Your role is to analyze a patient 
  based on the totality of symptoms. When given patient data:
  1. Identify key symptoms, prioritizing mental and emotional traits 
     (fears, anxieties, personality, behavioral patterns)
  2. Match symptoms to remedies using Kent's Repertory logic — focus on 
     combinations, not isolated symptoms
  3. Refer to Boericke's Materia Medica for constitutional understanding
  4. Suggest top 2-3 remedies with full reasoning
  5. For each remedy explain: mental/emotional match, physical symptom 
     support, distinguishing traits vs other remedies
  6. Write a constitutional profile paragraph summarizing the patient's 
     homeopathic essence
  
  Respond ONLY in this exact JSON format with no extra text or markdown:
  {
    "constitutional_profile": "string",
    "remedies": [
      {
        "name": "string",
        "match_strength": "High" | "Medium",
        "mental_emotional_match": "string",
        "physical_support": "string",
        "distinguishing_traits": "string"
      }
    ]
  }`;

  const userMessage = `Patient Details:
  Age: ${formData.age} | Gender: ${formData.gender}
  Chief Complaint: ${formData.chiefComplaint}
  Duration: ${formData.duration}
  
  Mental & Emotional Symptoms:
  Mood/Personality: ${formData.mood}
  Fears: ${formData.fears ? formData.fears.join(', ') : ''}
  Anxiety Triggers: ${formData.anxietyTriggers}
  Sleep Quality: ${formData.sleepQuality} | Position: ${formData.sleepPosition}
  Dreams: ${formData.dreams}
  
  Physical Generals:
  Thermal: ${formData.thermal}
  Thirst: ${formData.thirst}
  Sweat: ${formData.sweat}
  Cravings: ${formData.cravings ? formData.cravings.join(', ') : ''}
  Aversions: ${formData.aversions ? formData.aversions.join(', ') : ''}
  Time of Aggravation: ${formData.aggravationTime ? formData.aggravationTime.join(', ') : ''}
  
  Particular Complaints:
  Location: ${formData.location}
  Sensations: ${formData.sensations ? formData.sensations.join(', ') : ''}
  Better from: ${formData.betterFrom}
  Worse from: ${formData.worseFrom}
  Associated Symptoms: ${formData.associatedSymptoms}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const requestBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    
    // Strip accidental markdown fences
    responseText = responseText.replace(/^```(json)?|^\s*|^\n/gi, '').replace(/```$/g, '').trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response JSON:', responseText);
      return res.status(500).json({ error: "Analysis failed. Please retry." });
    }

    return res.json({
      constitutional_profile: parsedResponse.constitutional_profile,
      remedies: parsedResponse.remedies,
      form_data: formData
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: "Analysis failed. Please retry." });
  }
});

module.exports = router;
