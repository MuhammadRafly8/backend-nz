/**
 * Utility function to construct proper image URLs
 * @param {string} filename - The image filename
 * @returns {string} - Complete image URL
 */
const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // If filename is already a complete URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Construct URL based on environment
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Utility function to get relative image path for database storage
 * @param {string} filename - The image filename
 * @returns {string} - Relative path for database storage
 */
const getImagePath = (filename) => {
  if (!filename) return null;
  
  // If filename is already a complete URL, extract just the filename
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename.split('/').pop();
  }
  
  return filename;
};

module.exports = {
  getImageUrl,
  getImagePath
};
