import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [isFileCompressing, setIsFileCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resizeAndCompressImage = useCallback(
    (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }
            }

            canvas.width = width || 1;
            canvas.height = height || 1;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(objectUrl);
              URL.revokeObjectURL(objectUrl);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
          } catch (canvasErr) {
            reject(canvasErr);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        };
        img.src = objectUrl;
      });
    },
    []
  );

  const processAndUpload = useCallback(
    async (
      file: File,
      options: {
        maxWidth: number;
        maxHeight: number;
        quality: number;
        boardName: string;
        categoryId: string;
        storeCode?: string;
      }
    ): Promise<string> => {
      setIsFileCompressing(true);
      setUploadError(null);
      let processedBase64 = '';
      let usedFallback = false;

      try {
        processedBase64 = await resizeAndCompressImage(
          file,
          options.maxWidth,
          options.maxHeight,
          options.quality
        );
      } catch (err) {
        console.warn('[Base64 Compressor Error] Client compression failed, falling back to original:', err);
        const reader = new FileReader();
        processedBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        usedFallback = true;
      }

      if (usedFallback) {
        const base64Length = processedBase64.length - (processedBase64.indexOf(',') + 1);
        const sizeInBytes = (base64Length * 3) / 4;
        if (sizeInBytes > 10 * 1024 * 1024) {
          setIsFileCompressing(false);
          throw new Error('LIMIT_EXCEEDED');
        }
      }

      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const uniqueId = Math.random().toString(36).substring(2, 9).toUpperCase();
      const prefix = (options.boardName || 'UPLOAD').toUpperCase();
      const category = (options.categoryId || 'CAT').toUpperCase();
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const generatedFilename = `${prefix}_${category}_${uniqueId}_${timestamp}.${fileExt}`;

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: processedBase64,
            filename: generatedFilename,
            boardName: options.boardName,
            categoryId: options.categoryId,
            storeCode: options.storeCode,
          }),
        });

        const data = await res.json();
        setIsFileCompressing(false);
        if (data.success && data.url) {
          return data.url;
        } else {
          return processedBase64;
        }
      } catch (err) {
        setIsFileCompressing(false);
        return processedBase64;
      }
    },
    [resizeAndCompressImage]
  );

  return {
    isFileCompressing,
    setIsFileCompressing,
    uploadError,
    setUploadError,
    resizeAndCompressImage,
    processAndUpload,
  };
};
