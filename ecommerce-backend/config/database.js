// ====================================
// SUPABASE DATABASE CONFIGURATION
// ====================================

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client for general operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create admin client for privileged operations (if needed)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Database connection test function
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

// Helper function to set session context for RLS
const setSessionContext = async (sessionId) => {
  if (!sessionId) return;
  
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.session_id',
      setting_value: sessionId
    });
  } catch (error) {
    console.warn('Warning: Could not set session context:', error.message);
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection,
  setSessionContext
};