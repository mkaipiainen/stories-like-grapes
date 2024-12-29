import { Plant } from '@api/src/db/types/plant';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Text,
} from '@mantine/core';
import { S3Image } from '@/src/components/s3-image.tsx';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Fragment, useEffect, useState } from 'react';
import { Image as DbImage } from '@api/src/db/types/image';
import { UsePlantPlaceholderImage } from '@/src/hooks/use-plant-placeholder-image.tsx';
import { trpc } from '@/src/util/trpc.ts';
import { ENTITY_TYPE } from '@api/src/constants/entity.constant.ts';
import { UseFileUpload } from '@/src/hooks/use-file-upload.tsx';
import { useDisclosure } from '@mantine/hooks';
import { Carousel } from '@mantine/carousel';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';

export function ImageManager(props: { plant: Plant }) {
  const [opened, { open, close }] = useDisclosure(false);

  const { doUpload, isUploadLoading } = UseFileUpload();
  const utils = trpc.useUtils();

  const getImagesQuery = trpc.image.getByEntity.useQuery({
    entityType: ENTITY_TYPE.PLANT,
    entityId: props.plant.id,
  });
  const updateMutation = trpc.plant.update.useMutation({
    onSuccess: () => {
      utils.plant.get.invalidate();
      utils.image.getByEntity.invalidate();
    },
  });

  useEffect(() => {
    console.log(getImagesQuery);
    if (getImagesQuery.isSuccess) {
      const mainImage = getImagesQuery.data.find(
        (singleImage) => singleImage.id === props.plant.main_image_id,
      );
      setImages({
        selectedImage: mainImage ?? getImagesQuery.data[0],
        images: getImagesQuery.data.filter(
          (image) => image.id !== mainImage?.id,
        ),
        allImages: getImagesQuery.data.filter(
          (image): image is DbImage => !!image,
        ),
      });
    }
  }, [getImagesQuery.data, getImagesQuery.isSuccess]);
  const [images, setImages] = useState<{
    selectedImage: DbImage | undefined;
    images: DbImage[];
    allImages: DbImage[];
  }>({
    selectedImage: undefined,
    images: [],
    allImages: [],
  });
  const placeholderImage = UsePlantPlaceholderImage(props.plant);

  function doUploadImage(files: FileWithPath[]) {
    doUpload(files[0], {
      id: props.plant.id,
      type: ENTITY_TYPE.PLANT,
    }).then(() => {
      utils.image.getByEntity.invalidate();
    });
  }

  return (
    <>
      <Group className={'basis-1/2'} wrap={'nowrap'}>
        {/*<Image*/}
        {/*  style={{ viewTransitionName: 'plant-image' }}*/}
        {/*  src={placeholderImage}*/}
        {/*  height={160}*/}
        {/*  alt="Plant image placeholder"*/}
        {/*  className={'object-contain w-40 h-40'}*/}
        {/*/>*/}
        <S3Image
          id={images.selectedImage?.id}
          onClick={() => open()}
          className={
            'object-cover cursor-pointer hover:shadow-md hover:outline-1 transition w-40 h-40'
          }
        />
        <Group wrap={'wrap'}>
          {images.images.map((image) => {
            return (
              <Fragment key={image.id}>
                <S3Image
                  onClick={() => open()}
                  key={image.id}
                  id={image.id}
                  className={
                    'object-cover cursor-pointer hover:shadow-md hover:outline-1 transition w-12 h-12'
                  }
                />
              </Fragment>
            );
          })}
          {isUploadLoading ? (
            <Loader type={'bars'} size={'sm'}></Loader>
          ) : (
            <Dropzone onDrop={doUploadImage}>
              <Dropzone.Idle>
                <ActionIcon
                  color="rgba(0, 0, 0, 0.2)"
                  variant="filled"
                  aria-label="Add an image"
                  className={'relative'}
                >
                  <>
                    <FontAwesomeIcon icon={faImage}></FontAwesomeIcon>
                    <FontAwesomeIcon
                      className={'absolute top-0 right-0'}
                      color={'rgba(0, 0, 0, 0.4)'}
                      icon={faPlus}
                      size={'sm'}
                    ></FontAwesomeIcon>
                  </>
                </ActionIcon>
              </Dropzone.Idle>
            </Dropzone>
          )}
        </Group>
      </Group>
      <Modal opened={opened} onClose={close} title="Images for plant">
        <Carousel withIndicators height={200}>
          {images.allImages.map((image) => {
            return (
              <Carousel.Slide key={image.id}>
                <div className={'relative'}>
                  <S3Image
                    className={'w-full h-full object-cover'}
                    id={image.id}
                  ></S3Image>
                  <div className={'absolute top-1 right-1 flex items-center'}>
                    {image.id === props.plant.main_image_id ? (
                      <Badge leftSection={<FontAwesomeIcon icon={faCheck} />}>
                        Primary image
                      </Badge>
                    ) : (
                      <Button
                        onClick={() =>
                          updateMutation.mutate({
                            id: props.plant.id,
                            main_image_id: image.id,
                          })
                        }
                      >
                        <Text size={'sm'}>Make primary image</Text>
                      </Button>
                    )}
                  </div>
                </div>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Modal>
    </>
  );
}
