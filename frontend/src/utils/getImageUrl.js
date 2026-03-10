export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // New Cloudinary images — already a full HTTPS URL
    if (imagePath.startsWith('http')) return imagePath;

    // Old local /uploads/ images — served from the backend server
    const backendUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5000';
    return `${backendUrl}${imagePath}`;
};
