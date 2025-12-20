import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadToLocal = async (buffer, fileName, folder = 'documents') => {
  try {
    // Create unique filename
    const uniqueId = uuidv4();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uniqueId}.${fileExtension}`;
    
    // Create folder if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
    
    // Save file locally
    const filePath = join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/${folder}/${uniqueFileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file locally:', error);
    throw error;
  }
};
