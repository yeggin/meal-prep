//TODO: Add authentication middleware to all routes
//TODO: Decide JSON output format (.single() for all routes?)
import multer from 'multer';

import express from 'express';
const router = express.Router();

import { getAllRecipes, getRecipeById, createRecipe, getRecipeIngredients, updateRecipe, deleteRecipe } from '../controllers/recipeController.js';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// TODO: add user_id -> authentication for all routes

router.post('/recipes', upload.single('image'), createRecipe);
//router.post('/recipe', recipeController.createRecipe);
router.get('/recipes', getAllRecipes);
router.get('/recipes/:id', getRecipeById);
router.get('/recipes/:recipe_id/ingredients', getRecipeIngredients);
router.put('/recipes/:id', upload.single('image'), updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

export default router;
