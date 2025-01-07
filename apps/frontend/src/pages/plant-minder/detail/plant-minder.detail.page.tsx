import { trpc } from '@/src/util/trpc.ts';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { PaperDistort } from '@/src/components/paper-distort.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TAG_OPTIONS, TAGS } from '@/src/constants/tags.ts';
import { useQuill } from 'react-quilljs';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { notifications } from '@mantine/notifications';
import { equals } from 'rambda';
import { useDebouncedCallback } from '@mantine/hooks';
import {
  PlantUpdateData,
  PlantWithTagsAndImages,
} from '@api/src/db/types/plant';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { AsNumber } from '@/src/util/to-number.ts';
import { ImageManager } from '@/src/pages/plant-minder/detail/components/image-manager.tsx';
import { UsePlantPlaceholderImage } from '@/src/hooks/use-plant-placeholder-image.tsx';
import { UsePlantMood } from '@/src/hooks/use-plant-mood.tsx';
import { useAppSelector } from '@/src/stores/store.ts';
import { faArrowLeft, faDroplet } from '@fortawesome/free-solid-svg-icons';
import background from '@/src/assets/images/plant-background.webp';

export function PlantMinderDetailPage() {
  const trpcContext = trpc.useUtils();
  const navigate = useNavigate();
  const dissolve = useDissolve();
  const isInited = useRef(false);
  const utils = trpc.useUtils();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isSuccess } = trpc.plant.get.useQuery(id ?? '');
  const lastWateredById = trpc.plant.getLastWateredById.useQuery(id ?? '');
  const placeholderImage = UsePlantPlaceholderImage(data);
  const mood = UsePlantMood(data);
  const users = useAppSelector((state) => {
    return state.authReducer.users;
  });
  const [lastWateredBy, setLastWateredBy] = useState<string>('');

  useEffect(() => {
    if (!users.length || !lastWateredById.isSuccess) {
      setLastWateredBy('');
    } else {
      setLastWateredBy(
        users.find((user) => {
          return user.id === lastWateredById.data;
        })?.name ?? '',
      );
    }
  }, [users, lastWateredById]);
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        if (!isInited.current) {
          setEditableFields(getEditableFieldsFromData(data));

          isInited.current = true;
        }
      });
    }
  }, [isSuccess]);

  const updateMutation = trpc.plant.update.useMutation({
    onMutate: () => {
      doInvalidate();
    },
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
    onSuccess: () => {
      notifications.show({
        position: 'top-right',
        title: 'Plant watered!',
        message: 'Plant was watered succesfully',
      });
      utils.plant.get.invalidate();
    },
    onError: () => {
      notifications.show({
        position: 'top-right',
        color: 'red',
        title: 'Failed to water plant',
        message: 'There was an error watering the plant',
      });
    },
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
    onError: () => {
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

  const getWateringText = useCallback(() => {
    if (mood.daysUntilWatering > 0) {
      return `Water in ${mood.daysUntilWatering} days`;
    } else {
      if (mood.daysSinceWatering > 0) {
        return `Water today - ${mood.daysSinceWatering} overdue!`;
      } else {
        return 'Water today!';
      }
    }
  }, [mood]);

  return (
    <div className={'w-full h-full flex items-center justify-center relative'}>
      {isLoading ? (
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          pos={'absolute'}
        ></LoadingOverlay>
      ) : (
        <></>
      )}
      <div
        className={'flex h-full w-full flex-col relative max-w-5xl'}
        ref={container}
      >
        <Link
          className={'absolute top-1 left-1 z-10'}
          to={`/plant-minder/list`}
          viewTransition={true}
        >
          <ActionIcon
            color={'white'}
            className={'shadow-action shadow-primary-foreground'}
            variant="filled"
            size="xl"
            radius="xl"
            aria-label="Delete"
          >
            <FontAwesomeIcon
              size={'lg'}
              color={'black'}
              icon={faArrowLeft}
            ></FontAwesomeIcon>
          </ActionIcon>
        </Link>
        <Paper
          style={{
            filter:
              'url(#paper-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
            viewTransitionName: 'bg',
          }}
          className={
            'relative flex w-full items-center flex-col box-border p-4 mb-4'
          }
        >
          <div
            className={
              'flex absolute top-0 right-0 items-center p-4 box-border'
            }
          >
            {updateMutation.isPending ? (
              <div className={'flex items-center'}>
                <Loader size={'sm'}></Loader>
              </div>
            ) : (
              <div className={'flex items-center'}>
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
          <Group className={'w-full'}>
            <Image
              src={placeholderImage}
              height={80}
              alt="Plant image placeholder"
              className={'object-contain h-32 w-32'}
            />
            <Group
              className={'flex flex-grow flex-col items-start justify-center'}
            >
              <Text>{getWateringText()}</Text>
              <Text size={'xs'}>
                Last watered by <b>{lastWateredBy}</b> on{' '}
                {data?.last_watered?.toLocaleDateString()}
              </Text>
            </Group>
            <Group className={'flex flex-shrink flex-col'}>
              <ActionIcon
                color={'green'}
                onClick={() => onDoWater()}
                className={'shadow-action shadow-primary-foreground'}
                variant="filled"
                size="xl"
                radius="xl"
                aria-label="Delete"
              >
                <FontAwesomeIcon
                  size={'lg'}
                  color={'white'}
                  icon={faDroplet}
                ></FontAwesomeIcon>
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
        <div className={'horizontal-divider bg-primary-800'}></div>
        <Paper
          className={'flex w-full flex-col p-4'}
          style={{
            filter:
              'url(#paper-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
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
          <div className={'horizontal-divider bg-primary-800 my-4'}></div>
          <div className="min-h-40 w-full" ref={quillRef} />
        </Paper>
        <div className={'horizontal-divider bg-primary-800'}></div>
        <Paper
          style={{
            filter:
              'url(#paper-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
          }}
          className={'flex w-full items-center flex-col box-border p-4'}
        >
          <div className={'flex flex-col items-center md:flex-row w-full'}>
            <ImageManager plant={data}></ImageManager>
            <div
              className={
                'horizontal-divider md:vertical-divider bg-primary-400'
              }
            ></div>
            <div className={'flex flex-col basis-1/2 w-full'}>
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
              <div className="flex items-center p-4">
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
            </div>
          </div>
        </Paper>
        <div className={'horizontal-divider bg-primary-800'}></div>
        <Paper
          className={'flex w-full flex-col p-4'}
          style={{
            filter:
              'url(#paper-filter) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
          }}
        >
          <Group justify={'flex-end'}>
            <Button
              color={'red'}
              onClick={() => deleteMutation.mutate(data!.id)}
            >
              Delete
            </Button>
          </Group>
        </Paper>
        <PaperDistort filterId={'paper-filter'}></PaperDistort>
      </div>
    </div>
  );
}
