import apiClient from './client';

/**
 * Generate recipes using OpenAI API through our backend proxy
 * @param {Object} params Recipe generation parameters
 * @param {Array} params.preferences Array of dietary preferences ids
 * @param {String} params.mealType Type of meal (breakfast, lunch, dinner, etc)
 * @param {Number|null} params.calorieTarget Target calories per serving
 * @param {String} params.additionalInfo Additional information for recipe generation
 * @returns {Promise<Array>} Array of recipe objects
 */
export const generateRecipesWithAI = async (params) => {
  try {
    // Construct a detailed prompt for the AI
    const prompt = constructRecipePrompt(params);
    
    // Prepare the request body for OpenAI
    const requestBody = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional chef specializing in creating delicious, practical recipes. Provide recipes in valid JSON format only with no additional text."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7
      // Do NOT use response_format with gpt-4-0613
      // response_format: { type: "json_object" }  // Only works with newer models
    };
    
    console.log("Sending request to backend:", { prompt });
    
    // Make the request to the backend proxy endpoint
    const response = await apiClient.post('/generate-recipes', {
      requestBody
    });
    
    // Extract and parse the AI response
    if (response.data && response.data.choices && response.data.choices[0].message.content) {
      const content = response.data.choices[0].message.content;
      console.log("Received response content:", content.substring(0, 100) + "...");
      
      try {
        // Attempt to parse the response as JSON
        // Sometimes OpenAI might return JSON with markdown code blocks, so try to clean that up
        let cleanedContent = content;
        if (content.includes("```json")) {
          cleanedContent = content.split("```json")[1].split("```")[0].trim();
        } else if (content.includes("```")) {
          cleanedContent = content.split("```")[1].split("```")[0].trim();
        }
        
        const parsedResponse = JSON.parse(cleanedContent);
        
        // The response should be a JSON object with a recipes array
        if (parsedResponse.recipes && Array.isArray(parsedResponse.recipes)) {
          return parsedResponse.recipes;
        }
        
        // If we get a different format but still have recipes
        return Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("Response content:", content);
        throw new Error("Invalid JSON response from AI service");
      }
    }
    
    throw new Error('Invalid response format from AI service');
  } catch (error) {
    console.error('Error generating recipes with OpenAI:', error);
    throw new Error(`Error from OpenAI API: ${error.message}`);
  }
};

/**
 * Construct a detailed prompt for the AI based on user parameters
 */
function constructRecipePrompt(params) {
  const { preferences, mealType, calorieTarget, additionalInfo } = params;
  
  // Convert mealType to match your database enum (Meal or Snack)
  const dbCategory = mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner' 
    ? 'Meal' 
    : 'Snack';
  
  let prompt = `Generate 3 detailed ${mealType} recipes`;
  
  // Add dietary preferences if any
  if (preferences && preferences.length > 0) {
    prompt += ` that are ${preferences.join(', ')}`;
  }
  
  // Add calorie target if specified
  if (calorieTarget) {
    prompt += ` with approximately ${calorieTarget} calories per serving`;
  }
  
  // Add additional information if provided
  if (additionalInfo && additionalInfo.trim()) {
    prompt += `. Additional requirements: ${additionalInfo}`;
  }
  
  // Specify the output format
  prompt += `
  
  Return the response as a JSON object with a 'recipes' array. Each recipe should include:
  - name: Recipe name
  - description: Brief description
  - duration: Preparation time in minutes
  - calories: Calories per serving
  - ingredients: Array of ingredient strings with quantities
  - instructions: Array of step-by-step instructions
  - category: The category must be "${dbCategory}" to match my database enum
  
  Format:
  {
    "recipes": [
      {
        "name": "Recipe Name",
        "description": "Brief description",
        "duration": 30,
        "calories": 500,
        "ingredients": ["1 cup ingredient 1", "2 tbsp ingredient 2"],
        "instructions": ["Step 1 description", "Step 2 description"],
        "category": "${dbCategory}"
      }
    ]
  }`;
  
  return prompt;
}