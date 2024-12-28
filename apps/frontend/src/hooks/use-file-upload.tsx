import { trpc } from '@/src/util/trpc.ts';
import { FileWithPath } from '@mantine/dropzone';
import { EntityType } from '@api/src/constants/entity.constant.ts';
import { Image } from '@api/src/db/types/image';
import { useState } from 'react';

export function UseFileUpload() {
  const imageMutation = trpc.image.create.useMutation();
  const [isUploadLoading, setIsLoading] = useState(false);

  function doUpload(
    file: FileWithPath,
    parentEntity: {
      type: EntityType;
      id: string;
    },
  ): Promise<Image> {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result;
        if (typeof base64Data !== 'string') {
          console.error('Failed to convert file to base64 string');
          return;
        }

        const mimeType = file.type;
        const filename = file.name;

        // Now call your mutation with the base64 data URL
        try {
          const uploadedImage = await imageMutation.mutateAsync({
            entityType: parentEntity.type,
            entityId: parentEntity.id,
            imageData: base64Data, // This should be something like "data:<mimeType>;base64,<encoded-string>"
            filename: filename,
            mimeType: mimeType,
          });
          if (uploadedImage) {
            setIsLoading(false);
            resolve(uploadedImage);
          } else {
            reject('Uploading image failed');
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return { isUploadLoading, doUpload };
}
