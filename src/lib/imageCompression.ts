/**
 * Compress image to max 500KB
 * Supports JPEG, PNG, WebP formats
 * Returns a Blob with the compressed image
 */
export async function compressImage(file: File, maxSizeKB: number = 500): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        // Scale down if image is too large
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.85;
        let attempts = 0;
        const maxAttempts = 10;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const fileSizeKB = blob.size / 1024;
              attempts++;

              // If size is within limit, we're done
              if (fileSizeKB <= maxSizeKB || attempts >= maxAttempts) {
                resolve(blob);
                return;
              }

              // Reduce quality and try again
              quality -= 0.08;
              if (quality < 0.1) quality = 0.1;
              
              tryCompress();
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Convert File to Blob using compression
 */
export async function fileToCompressedBlob(file: File, maxSizeKB: number = 500): Promise<Blob> {
  return compressImage(file, maxSizeKB);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
