import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/ui/NavBar'; // Import Navbar component

// Import pages
import RecipeList from './pages/recipes/RecipeList';
import RecipeDetail from './pages/recipes/RecipeDetail';
import RecipeNew from './pages/recipes/RecipeNew';
import RecipeEdit from './pages/recipes/RecipeEdit';
import MealPlanList from './pages/mealplans/MealPlanList';
import MealPlanNew from './pages/mealplans/MealPlanNew';
import MealPlanEdit from './pages/mealplans/MealPlanEdit';
import AIRecipeGenerator from './components/ai-assistant/RecipeGenerator';
import LoginPage from './pages/Login';
// import Home from './pages/Home';

function App() {
  return (
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with Navbar */}
            <Route path="/*" element={<ProtectedLayout />} />
            
            {/* Individual protected routes */}
            <Route path="/recipes" element={<ProtectedRoute><RecipeList /></ProtectedRoute>} />
            <Route path="/recipes/new" element={<ProtectedRoute><RecipeNew /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeEdit /></ProtectedRoute>} />
            <Route path="/mealplans" element={<ProtectedRoute><MealPlanList /></ProtectedRoute>} />
            <Route path="/mealplans/new" element={<ProtectedRoute><MealPlanNew /></ProtectedRoute>} />
            <Route path="/mealplans/:id" element={<ProtectedRoute><MealPlanEdit /></ProtectedRoute>} />
            <Route path="/recipe-generator" element={<ProtectedRoute><AIRecipeGenerator /></ProtectedRoute>} />
            {/* <Route path="/budibase" element={<ProtectedRoute><Budibase /></ProtectedRoute>} /> */}

            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
  );
}

// Navbar layout for protected routes
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          {/* Default redirect */}
          <Navigate to="/recipes" replace />
        </div>
      </>
    </ProtectedRoute>
  );
}

export default App;