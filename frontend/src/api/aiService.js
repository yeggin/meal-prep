// Helper function for API calls with Bearer token authorization
const callApiWithBearerToken = async (endpoint, apiKey, data) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
};
  
const parseRecipeResponse = (aiResponse) => {
    try {
      const recipes = [];
      
      // Parse text response from AI
      if (typeof aiResponse === 'string') {
        // Split by recipe headings (more robust pattern)
        const recipeBlocks = aiResponse.split(/Recipe \d+:|(?=Title:)/g).filter(block => block.trim());
        
        recipeBlocks.forEach(block => {
          // Extract name with more flexible pattern
          const nameMatch = block.match(/(?:Title:|^)(.*?)(?:\r?\n|$)/);
          const name = nameMatch ? nameMatch[1].trim() : "Untitled Recipe";
          
          // Extract description with more robust pattern
          const descriptionMatch = block.match(/Description:([\s\S]*?)(?:Ingredients:|$)/i);
          const description = descriptionMatch ? descriptionMatch[1].trim() : 
            `A delicious ${name.toLowerCase()} recipe.`;
          
          // Extract ingredients with improved parsing
          const ingredientsMatch = block.match(/Ingredients:([\s\S]*?)(?:Instructions:|Directions:|Preparation:|Steps:|$)/i);
          const ingredientsText = ingredientsMatch ? ingredientsMatch[1].trim() : "";
          const ingredients = ingredientsText
            .split(/\r?\n/)
            .map(i => i.trim())
            .filter(i => i && !i.match(/^ingredients$/i))
            .map(i => i.replace(/^[•\-\*]\s*/, '').trim())
            .filter(Boolean);
          
          // Extract instructions with improved parsing
          const instructionsMatch = block.match(/(?:Instructions|Directions|Preparation|Steps):([\s\S]*?)(?:Nutrition:|Nutritional Information:|Calories:|Prep Time:|Preparation Time:|$)/i);
          const instructionsText = instructionsMatch ? instructionsMatch[1].trim() : "";
          const instructions = instructionsText
            .split(/\r?\n/)
            .map(i => i.trim())
            .filter(Boolean)
            .map(i => i.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter(Boolean);
          
          // Extract calories - look for various formats
          const caloriesMatch = block.match(/(?:Calories:|Caloric content:)?\s*(?:Approximately\s*)?(\d+)(?:\s*kcal|\s*calories)?/i);
          const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 
            Math.floor(Math.random() * 300) + 200; // Fallback to random value if not found
          
          // Extract preparation time with improved pattern matching
          const timeMatch = block.match(/(?:Prep[aration]* Time|Total Time|Cook Time|Time Required):\s*(?:About\s*)?(\d+)(?:\s*minutes|\s*mins)?/i);
          const duration = timeMatch ? parseInt(timeMatch[1]) : 
            Math.floor(Math.random() * 30) + 15; // Fallback to random value if not found
          
          // Determine category based on meal type in the request
          let category = 'Meal';
          // This will be filled in when we use the mealType from requestData
          // Default fallback logic
          if (duration < 20 || 
              name.toLowerCase().includes('snack') || 
              block.toLowerCase().includes('snack')) {
            category = 'Snack';
          }
          
          recipes.push({
            name,
            ingredients: ingredients.length ? ingredients : ["Ingredient information not available"],
            instructions: instructions.length ? instructions : ["Instructions not available"],
            calories,
            description,
            duration,
            category
          });
        });
      } else if (typeof aiResponse === 'object') {
        // Handle structured data directly
        if (Array.isArray(aiResponse)) {
          return aiResponse.map(recipe => ({
            name: recipe.name || recipe.title || "Untitled Recipe",
            ingredients: recipe.ingredients || ["Ingredient information not available"],
            instructions: recipe.instructions || recipe.steps || ["Instructions not available"],
            calories: recipe.calories || recipe.calorieCount || Math.floor(Math.random() * 300) + 200,
            description: recipe.description || `A delicious ${recipe.name || recipe.title || "recipe"}.`,
            duration: recipe.duration || recipe.prepTime || recipe.time || Math.floor(Math.random() * 30) + 15,
            category: (recipe.category || 
              (recipe.duration < 20 || recipe.prepTime < 20) ? 'Snack' : 'Meal')
          }));
        } else if (aiResponse.recipes) {
          return parseRecipeResponse(aiResponse.recipes);
        }
      }
      
      return recipes;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return [];
    }
};
  
export const generateRecipesWithAI = async (requestData) => {
    try {
        const { preferences, mealType, calorieTarget, additionalInfo } = requestData;
        
        // Determine the appropriate category based on mealType
        const categoryMap = {
            'breakfast': 'Meal',
            'lunch': 'Meal',
            'dinner': 'Meal',
            'snack': 'Snack',
            'dessert': 'Snack'
        };
        const OPENAI_COMPATIBLE_API_KEY = import.meta.env.VITE_OPENAI_API_KEY 
        const OPENAI_COMPATIBLE_ENDPOINT = import.meta.env.VITE_OPENAI_ENDPOINT || 
            "https://api.openai.com/v1/chat/completions";
        
        
        // Add custom headers if needed
        // For example, if using a different API that requires an API key in X-API-Key header:
        // headers["X-API-Key"] = OPENAI_COMPATIBLE_API_KEY;
        
        // Create a more structured prompt
        let prompt = `Generate 3 detailed ${mealType || 'meal'} recipes`;
        
        if (preferences && preferences.length > 0) {
            prompt += ` that are ${preferences.join(', ')}`;
        }
        
        if (calorieTarget) {
            prompt += ` with approximately ${calorieTarget} calories per serving`;
        }
        
        if (additionalInfo) {
            prompt += `. Additional requirements: ${additionalInfo}`;
        }
        
        // Include formatting instructions with clearer structure
        prompt += `\n\nFor each recipe, please provide the following information in this exact format:
            Title: [Recipe Name]
            Description: [A brief description of the recipe]
            Ingredients:
            - [Ingredient 1 with measurements]
            - [Ingredient 2 with measurements]
            - etc.
            
            Instructions:
            1. [Step 1]
            2. [Step 2]
            3. etc.
            
            Prep Time: [Time in minutes]
            Calories: [Calories per serving]
            `;
        
        // Make API call using the Bearer token auth helper function
        const requestBody = {
            model: "gpt-3.5-turbo", // or whatever model your API supports
            messages: [
            {
                role: "system",
                content: "You are a culinary assistant that specializes in generating detailed recipes with precise calorie counts. Format your response exactly as requested by the user."
            },
            {
                role: "user",
                content: prompt
            }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
        
        const result = await callApiWithBearerToken(
            OPENAI_COMPATIBLE_ENDPOINT,
            OPENAI_COMPATIBLE_API_KEY,
            requestBody
        );
        
        const aiResponse = result.choices[0]?.message?.content || "";
        
        // Parse the response to extract recipe details
        const recipes = parseRecipeResponse(aiResponse);
        
        // Default category based on meal type
        const defaultCategory = categoryMap[mealType] || 'Meal';
        
        // Validate the recipes before returning
        return recipes.map(recipe => ({
            ...recipe,
            // Ensure all properties exist and have valid values
            name: recipe.name || "Untitled Recipe",
            ingredients: Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? 
            recipe.ingredients : ["Ingredient information not available"],
            instructions: Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? 
            recipe.instructions : ["Instructions not available"],
            calories: typeof recipe.calories === 'number' && !isNaN(recipe.calories) ? 
            recipe.calories : Math.floor(Math.random() * 300) + 200,
            description: recipe.description || `A delicious ${recipe.name.toLowerCase()} recipe.`,
            duration: typeof recipe.duration === 'number' && !isNaN(recipe.duration) ? 
            recipe.duration : Math.floor(Math.random() * 30) + 15,
            category: ['Meal', 'Snack'].includes(recipe.category) ? recipe.category : defaultCategory
        }));
    } catch (error) {
      console.error("Error generating recipes with AI:", error);
      throw error;
    }
};