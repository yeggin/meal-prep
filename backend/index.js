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
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
import recipeRoutes from './routes/recipes.js';
import mealplanRoutes from './routes/mealplans.js';

app.use('/api/recipes', recipeRoutes);
app.use('/api/', mealplanRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
