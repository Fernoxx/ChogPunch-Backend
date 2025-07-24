// Supabase client configuration
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for database operations
async function insertData(table, data) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data);
        
        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

async function fetchData(table, filters = {}) {
    try {
        let query = supabase.from(table).select('*');
        
        // Apply filters if provided
        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key]);
        });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function updateData(table, updates, filters) {
    try {
        let query = supabase.from(table).update(updates);
        
        // Apply filters
        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key]);
        });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}

module.exports = {
    supabase,
    insertData,
    fetchData,
    updateData
};