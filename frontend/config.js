const config = {
    // This will be replaced with the actual backend URL when deployed
    backendUrl: process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-url.com'  // Replace with your actual backend URL
        : 'http://localhost:5001'
}; 