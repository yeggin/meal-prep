import { generateWithOpenAI, sanitizeResponseForLogging } from '../services/aiService.js';

/**
 * Handle recipe generation requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateRecipes = async (req, res) => {
  try {
    console.log('Recipe generation request received');
    
    // Extract request body
    const { requestBody } = req.body;
    
    // Validate the request format
    if (!requestBody || !requestBody.messages) {
      console.error('Invalid request format:', req.body);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request must include a requestBody with messages'
      });
    }
    
    // Log the request (without sensitive info)
    console.log('OpenAI Request:', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
    });
    
    try {
      // Call the OpenAI service
      const openaiResponse = await generateWithOpenAI(requestBody);
      
      // Log the successful response (sanitized)
      console.log('OpenAI API call successful:', sanitizeResponseForLogging(openaiResponse));
      
      // Return the successful response
      return res.json(openaiResponse);
    } catch (apiError) {
      console.error('Error during OpenAI API call:', apiError);
      return res.status(500).json({
        error: 'OpenAI API Communication Error',
        message: apiError.message
      });
    }
  } catch (error) {
    console.error('Unhandled error in generate-recipes endpoint:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};