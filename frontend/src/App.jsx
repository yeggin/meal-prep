//TODO: add navbar component
//TODO: add authentication middleware to all routes
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';

// Import pages
import RecipeList from './pages/recipes/RecipeList';
import RecipeDetail from './pages/recipes/RecipeDetail';
import RecipeNew from './pages/recipes/RecipeNew';
import RecipeEdit from './pages/recipes/RecipeEdit';
import MealPlanList from './pages/mealplans/MealPlanList';
import MealPlanNew from './pages/mealplans/MealPlanNew';
import MealPlanEdit from './pages/mealplans/MealPlanEdit';
import AIRecipeGenerator from './pages/ai-assistant/RecipeGenerator';
// import Home from './pages/Home';


// import Budibase from './pages/Budibase'; // adjust path if needed

//import CreateRecipe from './pages/recipes/CreateRecipe';

//TODO: Protected route component


function App() {
  // const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/recipes" element={<RecipeList />}/>
          <Route path="/recipes/new" element={<RecipeNew />}/>
          <Route path="/recipes/:id" element={<RecipeDetail />}/>
          <Route path="/recipes/:id/edit" element={<RecipeEdit />}/>
          <Route path="/mealplans" element={<MealPlanList />}/>
          <Route path="/mealplans/new" element={<MealPlanNew />}/>
          <Route path="/mealplans/:id" element={<MealPlanEdit />}/>
          <Route path="/ai-assistant" element={<AIRecipeGenerator />} />
          {/* <Route path="/budibase" element={<Budibase />}/> */}
      </Routes>
    </div>
  )
}

export default App
