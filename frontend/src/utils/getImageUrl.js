export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    // Default development backend URL
    const baseUrl = 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
};
