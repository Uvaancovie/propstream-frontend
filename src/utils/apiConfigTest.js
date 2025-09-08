// Test script to verify API configuration
console.log('API Configuration Test');
console.log('=====================');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('API_BASE_URL fallback:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
console.log('=====================');

// Don't remove this export - it's needed for Vite to process this as a module
export default {};
