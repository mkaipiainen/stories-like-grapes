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
import { Fragment, useEffect, useState } from 'react';
import { Image as DbImage } from '@api/src/db/types/image';
import { trpc } from '@/src/util/trpc.ts';
import { ENTITY_TYPE } from '@api/src/constants/entity.constant.ts';
import { UseFileUpload } from '@/src/hooks/use-file-upload.tsx';
import { useDisclosure } from '@mantine/hooks';
import { Carousel } from '@mantine/carousel';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import { notifications } from '@mantine/notifications';
import { faClose } from '@fortawesome/free-solid-svg-icons';
export function ImageManager(props: { plant: Plant }) {
  const [opened, { open, close }] = useDisclosure(false);

  const { doUpload, isUploadLoading } = UseFileUpload();
  const utils = trpc.useUtils();
  const [selectedSlide, setSelectedSlide] = useState(0);
  const getImagesQuery = trpc.image.getByEntity.useQuery({
    entityType: ENTITY_TYPE.PLANT,
    entityId: props.plant.id,
  });
  const updateMutation = trpc.image.update.useMutation({
    onSuccess: () => {
      utils.plant.get.invalidate();
      utils.image.getByEntity.invalidate();
      notifications.show({
        position: 'top-right',
        title: 'Updated the image!',
        message:
          'Succesfully set the image as the new main image for the plant',
      });
    },
  });

  useEffect(() => {
    if (getImagesQuery.isSuccess) {
      const mainImage = getImagesQuery.data.find(
        (singleImage) => singleImage.is_main_image,
      );
      setImages({
        mainImage: mainImage,
        secondaryImages: getImagesQuery.data.filter(
          (image) => image.id !== mainImage?.id,
        ),
        allImages: getImagesQuery.data.filter(
          (image): image is DbImage => !!image,
        ),
      });
    }
  }, [getImagesQuery.data, getImagesQuery.isSuccess]);
  const [images, setImages] = useState<{
    mainImage: DbImage | undefined;
    secondaryImages: DbImage[];
    allImages: DbImage[];
  }>({
    mainImage: undefined,
    secondaryImages: [],
    allImages: [],
  });

  function doUploadImage(files: FileWithPath[]) {
    doUpload(files[0], {
      id: props.plant.id,
      type: ENTITY_TYPE.PLANT,
    }).then(() => {
      utils.image.getByEntity.invalidate();
      utils.plant.get.invalidate();
    });
  }

  return (
    <>
      <Group className={'basis-1/2 h-40 max-h-40'} wrap={'nowrap'}>
        {/*<Image*/}
        {/*  style={{ viewTransitionName: 'plant-image' }}*/}
        {/*  src={placeholderImage}*/}
        {/*  height={160}*/}
        {/*  alt="Plant image placeholder"*/}
        {/*  className={'object-contain w-40 h-40'}*/}
        {/*/>*/}
        {images.mainImage ? (
          <S3Image
            id={images.mainImage.id}
            onClick={() => {
              const index = images.allImages.findIndex((image) => {
                return image.id === images.mainImage?.id;
              });
              setSelectedSlide(index);
              open();
            }}
            className={
              'object-cover cursor-pointer hover:shadow-md hover:outline-1 transition w-40 h-40'
            }
          />
        ) : (
          <Dropzone className={'rounded-full'} onDrop={doUploadImage}>
            <Dropzone.Idle>
              <ActionIcon
                color="rgba(0, 0, 0, 0.4)"
                variant="subtle"
                radius={'xl'}
                size={'xl'}
                aria-label="Add an image"
                className={'relative h-16 w-16 rounded-full'}
              >
                <>
                  <AddAPhotoOutlinedIcon fontSize={'large'} />
                </>
              </ActionIcon>
            </Dropzone.Idle>
          </Dropzone>
        )}

        <Group className={'h-full'} wrap={'wrap'} align={'flex-start'}>
          {images.secondaryImages.map((image) => {
            return (
              <Fragment key={image.id}>
                <S3Image
                  onClick={() => {
                    const index = images.allImages.findIndex(
                      (singleImage) => singleImage.id === image.id,
                    );
                    setSelectedSlide(index);
                    open();
                  }}
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
          ) : images.mainImage ? (
            <Dropzone
              className={
                'rounded-full h-12 w-12 flex items-center justify-center'
              }
              onDrop={doUploadImage}
            >
              <Dropzone.Idle>
                <ActionIcon
                  color="rgba(0, 0, 0, 0.4)"
                  variant="subtle"
                  radius={'lg'}
                  size={'lg'}
                  aria-label="Add an image"
                  className={'relative'}
                >
                  <>
                    <AddAPhotoOutlinedIcon />
                  </>
                </ActionIcon>
              </Dropzone.Idle>
            </Dropzone>
          ) : (
            <></>
          )}
        </Group>
      </Group>
      <Modal.Root opened={opened} onClose={close}>
        <Modal.Overlay />
        <Modal.Content className={'flex items-center'}>
          <Modal.Body className={'p-0 relative'}>
            <FontAwesomeIcon
              className={'absolute top-0 right-0'}
              icon={faClose}
            ></FontAwesomeIcon>

            <Carousel
              loop={true}
              initialSlide={selectedSlide}
              withIndicators
              height={200}
            >
              {images.allImages.map((image) => {
                return (
                  <Carousel.Slide key={image.id}>
                    <div className={'relative h-full'}>
                      <S3Image
                        className={'w-full h-full object-cover'}
                        id={image.id}
                      ></S3Image>
                      <div
                        className={'absolute top-1 right-1 flex items-center'}
                      >
                        {image.is_main_image ? (
                          <Badge
                            leftSection={<FontAwesomeIcon icon={faCheck} />}
                          >
                            Primary image
                          </Badge>
                        ) : (
                          <Button
                            onClick={() =>
                              updateMutation.mutate({
                                id: image.id,
                                is_main_image: true,
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
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
