import express from 'express';
import { generateRecipes } from '../controllers/aiController.js';

const router = express.Router();

// Route for recipe generation
router.post('/generate-recipes', generateRecipes);

export default router;