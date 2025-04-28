import supabase from '../supabase.js';

// Create a new meal plan
export const createMealPlan = async (req, res) => {
    try {
        const { name, start_date, end_date, meal_items=[] } = req.body;

        const { data: mealplan, error: mealplanError } = await supabase
            .from('mealplans')
            .insert([
                { name, start_date, end_date }
            ])
            .select()
            .single();
        
        if (mealplanError) {
            console.error('Supabase meal plan error:', mealplanError);
            return res.status(500).json({ error: "Error creating meal plan."});
        }

        // If meal plan items were provided, insert them
        if (meal_items && meal_items.length > 0) {
            //Add mealplan_id to each item
            const mealItemsWithPlanId = meal_items.map(item => ({
                ...item,
                mealplan_id: mealplan.id
            }));

            const { error: itemsError } = await supabase
                .from('mealplanitems')
                .insert(mealItemsWithPlanId);
            
            if (itemsError) {
                console.error('Supabase meal plan items error:', itemsError);
                return res.status(500).json({ error: "Error creating meal plan items."});
            }
        }

        // Return the created meal plan with its items
        const { data: completeData, error: fetchError } = await supabase
            .from('mealplans')
            .select(`*,mealplanitems (*)`)
            .eq('id', mealplan.id)
            .single();
        
        if (fetchError ) {
            console.error('Supabase fetch error:', fetchError);
            // Still return success since the data was created
            return res.status(201).json({
                message: "Meal plan created successfully.",
                mealplan: mealplan
            });
        }

        res.status(201).json({
            message: "Meal plan created successfully.",
            mealplan: completeData
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
}

// Get all meal plans
export const getAllMealPlans = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = supabase
            .from('mealplans')
            .select(`*,mealplanitems:mealplanitems(*,recipe:recipes(*))`);

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const { data: mealplans, error } = await query;

        if (error) {
            console.error('Supabase meal plans error:', error);
            return res.status(500).json({ error: "Error fetching meal plans."});
        }

        const transformedMealplans = mealplans.map(mealplan => {
            return {
                ...mealplan,
                recipes: mealplan.mealplanitems.map(item => item.recipe)
            };
        });

        res.status(200).json(transformedMealplans);
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
}

// Get a meal plan by ID
export const getMealPlanById = async (req, res) => {
    const {id} = req.params;
    try {
        const {data: mealplan, error: mealplanError} = await supabase
            .from('mealplans')
            .select(`*,mealplanitems:mealplanitems(*,recipe:recipes(*))`)
            .eq('id', id)
            .single()
        
        const {data: mealplanitems, error: mealplanitemsError} = await supabase
            .from('mealplanitems')
            .select('*')
            .eq('mealplan_id', id)

        if (mealplanError) { 
            console.error('Supabase meal plan error:', mealplanError);
            return res.status(500).json({ error: "Error fetching meal plan."});
        }

        if (mealplanitemsError) {
            console.error('Supabase meal plan items error:', mealplanitemsError);
            return res.status(500).json({ error: "Error fetching meal plan items."});
        }

        const transformedMealplan = {
            ...mealplan,
            recipes: mealplan.mealplanitems.map(item => item.recipe)
        };

        res.status(200).json(transformedMealplan)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error."})
    }
}

// Update a meal plan by ID
export const updateMealPlan = async (req, res) => {
    const { id } = req.params;
    const { name, start_date, end_date, meal_items = [] } = req.body;

    try {
        const { data: mealplan, error: mealplanError } = await supabase
            .from('mealplans')
            .update({
                name: name,
                start_date: start_date,
                end_date: end_date,
            })
            .eq('id', id)
            .select()
            .single()

        if (mealplanError) {
            console.error('Supabase update error:', mealplanError)
            return res.status(500).json({ error: 'Error updating meal plan.' });
        }
        
        // Update meal plan items: Delete existing or insert new ones
        if (meal_items && meal_items.length > 0) {
            // Delete existing meal plan items
            const { error: deleteError } = await supabase
                .from('mealplanitems')
                .delete()
                .eq('mealplan_id', id);
            
            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                return res.status(500).json({ error: "Error deleting meal plan items."});
            }

            // Insert new meal plan items
            const mealItemsWithPlanId = meal_items.map(item => ({
                ...item,
                mealplan_id: id
            }));

            const { error: insertError } = await supabase
                .from('mealplanitems')
                .insert(mealItemsWithPlanId);
            
            if (insertError) {
                console.error('Supabase insert error:', insertError);
                return res.status(500).json({ error: "Error inserting meal plan items."});
            }
        }
        
        res.status(200).json({message: 'Meal plan updated successfully.', mealplan});
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

// Delete a meal plan
export const deleteMealPlan = async (req, res) => {
    const { id } = req.params;

    try {
        
        const { data, error: deletePlanError } = await supabase
            .from('mealplans')
            .delete()
            .eq('id', id);
        
        if (deletePlanError) {
            console.error('Supabase delete plan error:', deletePlanError);
            return res.status(500).json({ error: "Error deleting meal plan."});
        }

        res.status(200).json({ message: 'Meal plan deleted successfully.', data });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: "Internal server error." });
    }
}