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

// In your index.js file, update the route handler:

app.post('/api/generate-recipes', async (req, res) => {
    try {
        const { requestBody } = req.body;
        
        console.log("Received request:", JSON.stringify(requestBody, null, 2));
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
            return res.status(response.status).json({
                error: `OpenAI API error: ${response.status} ${response.statusText}`,
                details: errorText
            });
        }
        
        const data = await response.json();
        console.log("OpenAI API response received");
        return res.json(data);
    } catch (error) {
        console.error("Error in generate-recipes endpoint:", error);
        return res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
