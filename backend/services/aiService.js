// AI Service for recipe generation
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generate recipes using OpenAI API
 * @param {Object} requestBody - The request body to send to OpenAI
 * @returns {Promise<Object>} The AI response
 */
export const generateWithOpenAI = async (requestBody) => {
  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Make the request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Handle API errors
    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('OpenAI API error details:', errorData);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (parseError) {
        const errorText = await response.text();
        console.error('OpenAI API error (text):', errorText);
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse and return the successful response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    throw error;
  }
};

/**
 * Sanitize the OpenAI response for logging
 * @param {Object} response - The OpenAI API response
 * @returns {Object} A sanitized version of the response
 */
export const sanitizeResponseForLogging = (response) => {
  if (!response) return null;
  
  return {
    id: response.id,
    model: response.model,
    usage: response.usage,
    choices: response.choices ? [{
      index: response.choices[0].index,
      finish_reason: response.choices[0].finish_reason,
      message: {
        role: response.choices[0].message.role,
        content_length: response.choices[0].message.content?.length || 0
      }
    }] : []
  };
};