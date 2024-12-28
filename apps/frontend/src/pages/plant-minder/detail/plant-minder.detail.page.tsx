import { trpc } from '@/src/util/trpc.ts';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  MultiSelect,
  MultiSelectProps,
  NumberInput,
  Paper,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { PaperDistort } from '@/src/components/paper-distort.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TAG_OPTIONS, TAGS } from '@/src/constants/tags.ts';
import { useQuill } from 'react-quilljs';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { notifications } from '@mantine/notifications';
import { UsePlantPlaceholderImage } from '@/src/hooks/use-plant-placeholder-image.tsx';
import { equals } from 'rambda';
import { useDebouncedCallback } from '@mantine/hooks';
import {
  PlantUpdateData,
  PlantWithTagsAndImages,
} from '@api/src/db/types/plant';
import { Image as DbImage } from '@api/src/db/types/image';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { AsNumber } from '@/src/util/to-number.ts';
import { S3Image } from '@/src/components/s3-image.tsx';
import { faImage, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { ENTITY_TYPE } from '@api/src/constants/entity.constant.ts';
import { UseFileUpload } from '@/src/hooks/use-file-upload.tsx';
import useSwapAnimation from '@/src/hooks/use-swap-animation.tsx';

export function PlantMinderDetailPage() {
  const trpcContext = trpc.useUtils();
  const navigate = useNavigate();
  const dissolve = useDissolve();
  const isInited = useRef(false);
  const utils = trpc.useUtils();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = trpc.plant.get.useQuery(id ?? '', {
    onSuccess: (data) => {
      setTimeout(() => {
        if (!isInited.current) {
          setEditableFields(getEditableFieldsFromData(data));

          isInited.current = true;
        }
      });
    },
  });
  trpc.image.getByEntity.useQuery(
    {
      entityType: ENTITY_TYPE.PLANT,
      entityId: id ?? '',
    },
    {
      onSuccess: (data) => {
        setImages({
          selectedImage: data[0],
          images: data,
        });
      },
    },
  );
  const updateMutation = trpc.plant.update.useMutation({
    onMutate: () => {
      doInvalidate();
    },
  });
  const [imageAnimationTarget, setImageAnimationTarget] = useState<
    DbImage | undefined
  >(undefined);
  const [images, setImages] = useState<{
    selectedImage: DbImage | undefined;
    images: DbImage[];
  }>({
    selectedImage: undefined,
    images: [],
  });
  const placeholderImage = UsePlantPlaceholderImage(data);
  const swapAnimation = useSwapAnimation({
    duration: 5000,
    easing: 'power2.inOut',
  });
  const [editableFields, setEditableFields] = useState<
    Required<PlantUpdateData>
  >({
    tags: [],
    description: '',
    name: 'string',
    watering_frequency: 0,
    id: '',
  });
  const { quill, quillRef } = useQuill();

  const container = useRef(null);
  const { doUpload, isUploadLoading } = UseFileUpload();

  useEffect(() => {
    if (quill && quill.root.innerHTML !== editableFields?.description) {
      quill.clipboard.dangerouslyPasteHTML(editableFields?.description ?? '');
      quill.setSelection(quill.getLength(), 0);
    }
  }, [quill, editableFields]);

  useEffect(() => {
    if (isInited.current) {
      doUpdate();
    }
  }, [editableFields, data]);

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setEditableFields({
          ...editableFields,
          description: quill.root.innerHTML,
        });
      });
    }
    return () => {
      if (quill) {
        quill.off('text-change');
      }
    };
  }, [quill, editableFields]);

  const doWaterMutation = trpc.plant.water.useMutation({
    onSettled: () => {
      doInvalidate();
    },
  });
  const deleteMutation = trpc.plant.delete.useMutation({
    onMutate: async () => {
      if (container.current) {
        await dissolve({
          element: container.current,
        }).then(() => {
          navigate('/plant-minder');
        });
      } else {
        navigate('/plant-minder');
      }
    },
    onError: (_err, _id, context) => {
      notifications.show({
        title: 'Error',
        message: 'There was a problem deleting the plant.',
      });
    },
    onSettled: async () => {
      await trpcContext.plant.list.invalidate();
    },
  });

  const doInvalidate = useDebouncedCallback(() => {
    // utils.plant.get.invalidate();
    utils.plant.list.invalidate();
  }, 1000);

  const doUpdate = useDebouncedCallback(() => {
    if (data) {
      const dataValues = getEditableFieldsFromData(data);
      if (!equals(editableFields, dataValues)) {
        updateMutation.mutate({
          ...editableFields,
          id: data.id,
        });
      }
    }
  }, 1000);

  function onDoWater() {
    if (!data) {
      return;
    }
    doWaterMutation.mutate(data.id);
  }

  const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
    option,
  }) => getTagBadge(option.value);

  function getTagBadge(tag: string) {
    const isSelected = editableFields.tags.includes(tag);
    const className = `flex-grow w-full p-2 transition bg-transparent`;
    return (
      <div className={'flex flex-col'}>
        <Group
          justify={'space-between bg-transparent'}
          gap="sm"
          className={className}
        >
          <div className={'flex items-center bg-transparent'}>
            <FontAwesomeIcon
              icon={TAGS[tag].icon}
              className={'mr-4'}
            ></FontAwesomeIcon>
            <Text className={'bg-transparent'} size="xs" opacity={0.5}>
              {TAGS[tag].label}
            </Text>
          </div>
          {isSelected ? (
            <FontAwesomeIcon icon={faCheck} color={'background-primary-text'} />
          ) : (
            <></>
          )}
        </Group>
      </div>
    );
  }

  function getEditableFieldsFromData(data: PlantWithTagsAndImages) {
    return {
      tags: data?.tags?.map((tag) => tag.name) ?? [],
      description: data?.description ?? '',
      name: data?.name ?? '',
      watering_frequency: data?.watering_frequency ?? 0,
      id: data?.id ?? '',
    };
  }

  function doUploadImage(files: FileWithPath[]) {
    if (!data) {
      throw new Error('No entity set, could not upload image');
    }
    doUpload(files[0], {
      id: data.id,
      type: ENTITY_TYPE.PLANT,
    }).then(() => {
      utils.image.getByEntity.invalidate();
    });
  }

  return (
    <>
      {isLoading ? (
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          pos={'absolute'}
        ></LoadingOverlay>
      ) : (
        <div
          className={'flex h-full w-full flex-col relative max-w-5xl'}
          ref={container}
        >
          <div className="absolute inset-0 -z-10"></div>
          <Paper
            style={{
              filter:
                'url(#bg-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
              viewTransitionName: 'bg',
            }}
            className={'flex w-full items-center flex-col box-border p-4'}
          >
            <div className={'flex flex-col items-center md:flex-row w-full'}>
              <Group className={'basis-1/2'} wrap={'nowrap'}>
                {/*<Image*/}
                {/*  style={{ viewTransitionName: 'plant-image' }}*/}
                {/*  src={placeholderImage}*/}
                {/*  height={160}*/}
                {/*  alt="Plant image placeholder"*/}
                {/*  className={'object-contain w-40 h-40'}*/}
                {/*/>*/}
                <S3Image
                  ref={swapAnimation.element1Ref}
                  id={images.selectedImage?.id}
                  className={
                    'object-cover cursor-pointer hover:shadow-md hover:outline-1 transition w-40 h-40'
                  }
                />
                <Group wrap={'wrap'}>
                  {images.images.map((image) => {
                    return (
                      <S3Image
                        onClick={() => {
                          setImageAnimationTarget(image);
                          swapAnimation.animateSwap().then(() => {
                            setImages({
                              images: images.images,
                              selectedImage: image,
                            });
                          });
                        }}
                        ref={
                          imageAnimationTarget?.id === image.id
                            ? swapAnimation.element2Ref
                            : undefined
                        }
                        key={image.id}
                        id={image.id}
                        className={
                          'object-cover cursor-pointer hover:shadow-md hover:outline-1 transition w-12 h-12'
                        }
                      />
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

              <div
                className={
                  'horizontal-divider md:vertical-divider bg-primary-400'
                }
              ></div>
              <div className={'flex flex-col basis-1/2'}>
                <div className={'w-full h-12 flex items-center p-4 box-border'}>
                  {updateMutation.isLoading ? (
                    <div className={'flex items-center mb-4'}>
                      <Loader size={'sm'}></Loader>
                    </div>
                  ) : (
                    <div className={'flex items-center mb-4'}>
                      <FontAwesomeIcon
                        className={'mr-4'}
                        icon={faCheck}
                        color={'green'}
                      ></FontAwesomeIcon>
                      <Text size={'sm'} c={'green'}>
                        Updated
                      </Text>
                    </div>
                  )}
                </div>

                <TextInput
                  autoComplete="off"
                  className={'p-4 w-full'}
                  onChange={(value) =>
                    setEditableFields({
                      ...editableFields,
                      name: value.target.value,
                    })
                  }
                  value={editableFields.name}
                  label={'Name'}
                  required={true}
                ></TextInput>
              </div>
            </div>
          </Paper>
          <div className={'horizontal-divider bg-primary-800'}></div>
          <Paper
            className={'flex w-full flex-col p-4'}
            style={{
              filter:
                'url(#bg-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
            }}
          >
            <MultiSelect
              placeholder="Add a tag..."
              onChange={(data: string[]) => {
                setEditableFields({
                  ...editableFields,
                  tags: data,
                });
              }}
              value={editableFields.tags}
              data={TAG_OPTIONS}
              renderOption={renderMultiSelectOption}
            />
            <div className="flex mt-4 items-center">
              <span className="text-nowrap mr-4 flex items-center">
                Water every{' '}
              </span>
              <NumberInput
                className={'mr-4 flex items-center'}
                value={editableFields.watering_frequency}
                min={0}
                max={undefined}
                onChange={(value) => {
                  setEditableFields({
                    ...editableFields,
                    watering_frequency: AsNumber(value),
                  });
                }}
                required={true}
              ></NumberInput>
              <span className={'flex items-center'}>days</span>
            </div>
          </Paper>
          <div className={'horizontal-divider bg-primary-800'}></div>

          <Paper
            className={'flex w-full flex-col p-4'}
            style={{
              filter:
                'url(#bg-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
            }}
          >
            <div className="min-h-40 w-full" ref={quillRef} />
          </Paper>
          <div className={'horizontal-divider bg-primary-800'}></div>
          <Paper
            className={'flex w-full flex-col p-4'}
            style={{
              filter:
                'url(#bg-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
            }}
          >
            <Button color={'green'} onClick={() => onDoWater()}>
              Water
            </Button>
            <Button
              color={'red'}
              onClick={() => deleteMutation.mutate(data!.id)}
            >
              Delete
            </Button>
          </Paper>
          <PaperDistort filterId={'bg-filter'}></PaperDistort>
        </div>
      )}
    </>
  );
}
