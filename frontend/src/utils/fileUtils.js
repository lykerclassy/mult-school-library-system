// frontend/src/utils/fileUtils.js

/**
 * Replaces spaces and illegal characters from a filename.
 * @param {string} name - The base name (e.g., "History Essay")
 * @returns {string} - A sanitized name (e.g., "History_Essay")
 */
const sanitizeFilename = (name) => {
  if (!name) return 'download';
  // Replaces most illegal characters and multiple spaces/underscores
  return name.replace(/[^a-z0-9_-\s.]/gi, '').replace(/[\s_]+/g, '_');
};

/**
 * Creates a clean, downloadable filename.
 * @param {string} title - The desired title (e.g., "History Essay" or "John Doe")
 * @param {string} originalFilename - The original uploaded file name (e.g., "my_work.pdf")
 * @returns {string} - A clean filename (e.g., "History_Essay.pdf")
 */
export const createDownloadFilename = (title, originalFilename) => {
  if (!originalFilename) return sanitizeFilename(title);
  
  // Get the extension (e.g., ".pdf")
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  
  // Sanitize the title
  const cleanTitle = sanitizeFilename(title);
  
  return `${cleanTitle}${extension}`;
};