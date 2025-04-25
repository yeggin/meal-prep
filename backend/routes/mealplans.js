import express from 'express';
const router = express.Router();
import { getAllMealPlans, getMealPlanById, createMealPlan, updateMealPlan, deleteMealPlan } from '../controllers/mealplanController.js';

router.post('/mealplans', createMealPlan);
router.get('/mealplans', getAllMealPlans);
router.get('/mealplans/:id', getMealPlanById);
router.put('/mealplans/:id', updateMealPlan);
router.delete('/mealplans/:id', deleteMealPlan);

export default router;