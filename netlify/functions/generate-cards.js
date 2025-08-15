// This is your new back-end function: netlify/functions/generate-cards.js

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GOOGLE_API_KEY; // Securely access the API key

    if (!apiKey) {
        throw new Error("API key is not set.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      throw new Error(`Google API failed with status ${apiResponse.status}`);
    }

    const result = await apiResponse.json();

    // Send the AI's text response back to the front-end
    const aiTextResponse = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: aiTextResponse
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};