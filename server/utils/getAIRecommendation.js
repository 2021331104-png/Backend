export async function getAIRecommendation(userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    const geminiPrompt = `
        Here is a list of avaiable products:
        ${JSON.stringify(products, null, 2)}

        Based on the following user request, filter and suggest the best matching products:
        "${userPrompt}"

        Only return the matching products in JSON format.
    `;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
      }),
    });

    const data = await response.json();
    const aiResponseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const cleanedText = aiResponseText.replace(/```json|```/g, ``).trim();

    if (!cleanedText) {
      return {
        success: false,
        products,
        message: "AI response was empty. Showing the best matched products without AI.",
      };
    }

    let parsedProducts;
    try {
      parsedProducts = JSON.parse(cleanedText);
    } catch (error) {
      const jsonMatch = cleanedText.match(/\[.*\]/s);
      if (jsonMatch) {
        parsedProducts = JSON.parse(jsonMatch[0]);
      } else {
        return {
          success: false,
          products,
          message: "Failed to parse AI response. Showing filtered results instead.",
        };
      }
    }
    return { success: true, products: parsedProducts };
  } catch (error) {
    return {
      success: false,
      products,
      message: "AI service is unavailable right now. Showing filtered results instead.",
    };
  }
}
