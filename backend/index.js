// Sets up environment variables
// Initializes Express
// Configures middleware (CORS, JSON parsing)
// Creates and exports the Supabase client
// Registers routes
// Starts the server

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
import recipeRoutes from './routes/recipes.js';
import mealplanRoutes from './routes/mealplans.js';

app.use('/api/recipes', recipeRoutes);
app.use('/api/', mealplanRoutes);

app.post('/api/generate-recipes', async (req, res) => {
    try {
      console.log('Recipe generation request received');
      
      // Extract request body
      const { requestBody } = req.body;
      
      if (!requestBody || !requestBody.messages) {
        console.error('Invalid request format:', req.body);
        return res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Request must include a requestBody with messages' 
        });
      }
      
      // Log OpenAI request (without sensitive info)
      console.log('OpenAI Request:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
      });
      
      // Check if API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return res.status(500).json({ 
          error: 'Server Configuration Error', 
          message: 'OpenAI API key not configured' 
        });
      }
      
      try {
        // Make the API request to OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });
        
        // Check for success/error
        if (!openaiResponse.ok) {
          let errorMessage = `OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`;
          
          try {
            const errorData = await openaiResponse.json();
            console.error('OpenAI API error details:', errorData);
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          } catch (parseError) {
            const errorText = await openaiResponse.text();
            console.error('OpenAI API error (text):', errorText);
            errorMessage += ` - ${errorText}`;
          }
          
          return res.status(openaiResponse.status).json({ 
            error: 'OpenAI API Error', 
            message: errorMessage 
          });
        }
        
        // Process successful response
        const data = await openaiResponse.json();
        console.log('OpenAI API call successful');
        
        return res.json(data);
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
  });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
