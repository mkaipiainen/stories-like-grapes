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
  Title,
} from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { PlantLog } from './components/plant-log';

export function PlantMinderDetailPage() {
  const trpcContext = trpc.useUtils();
  const navigate = useNavigate();
  const dissolve = useDissolve();
  const isInited = useRef(false);
  const utils = trpc.useUtils();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isSuccess } = trpc.plant.get.useQuery(id ?? '');
  const lastWateredById = trpc.plant.getLastWateredById.useQuery(id ?? '');
  const auditLogsQuery = trpc.plant.getAuditLog.useQuery({
    id: id ?? '',
    type: 'plant',
  });
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
      return `Next water in ${mood.daysUntilWatering} days`;
    } else {
      if (mood.daysSinceWatering > 0) {
        return `Needs water! (${mood.daysSinceWatering} days overdue)`;
      } else {
        return 'Needs water!';
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
            aria-label="Back"
          >
            <FontAwesomeIcon
              size={'lg'}
              color={'black'}
              icon={faArrowLeft}
            ></FontAwesomeIcon>
          </ActionIcon>
        </Link>
        <Paper
          className={'flex w-full flex-col p-4'}
          style={{
            filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
          }}
        >
          {/* Status section */}
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

          {/* Main Info Section */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start">
            {/* Image */}
            <div className="w-full md:w-auto flex justify-center md:justify-start">
              <Image
                src={placeholderImage}
                height={80}
                alt="Plant image placeholder"
                className={'object-contain h-32 w-32 flex-shrink-0'}
              />
            </div>

            {/* Details */}
            <div className="flex-grow w-full flex flex-col gap-4">
              <TextInput
                autoComplete="off"
                onChange={(value) =>
                  setEditableFields({
                    ...editableFields,
                    name: value.target.value,
                  })
                }
                value={editableFields.name}
                label={'Name'}
                required={true}
                size="md"
              />

              <div className="flex items-center justify-start">
                <span className="text-nowrap mr-4 flex items-center">
                  Water every{' '}
                </span>
                <NumberInput
                  className={'mr-4 w-24 flex items-center'}
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
                  size="sm"
                />
                <span className={'flex items-center'}>days</span>
              </div>

              <Group
                gap={0}
                justify={'flex-start'}
                className="flex flex-wrap items-center"
              >
                <Group
                  gap={0}
                  justify={'flex-start'}
                  align={'flex-start'}
                  className={'flex flex-col mr-4'}
                >
                  <Text className="font-medium" c={'color-danger'} size="md">
                    {getWateringText()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Last watered by <b>{lastWateredBy}</b> on{' '}
                    {data?.last_watered?.toLocaleDateString()}
                  </Text>
                </Group>
                <ActionIcon
                  color={'green'}
                  onClick={() => onDoWater()}
                  className={'shadow-action shadow-primary-foreground'}
                  variant="filled"
                  size="lg"
                  radius="xl"
                  aria-label="Water plant"
                >
                  <FontAwesomeIcon
                    size={'lg'}
                    color={'white'}
                    icon={faDroplet}
                  ></FontAwesomeIcon>
                </ActionIcon>
              </Group>
            </div>
          </div>

          <div className={'horizontal-divider h-1 bg-primary-800 mt-4'}></div>

          {/* Rest of your sections remain exactly the same */}
          <Text className="font-medium mb-2 mt-4" size="sm">
            Tags
          </Text>
          <MultiSelect
            placeholder="Add a tag..."
            onChange={(data: string[]) => {
              setEditableFields({
                ...editableFields,
                tags: data,
              });
            }}
            className={'mb-4'}
            value={editableFields.tags}
            data={TAG_OPTIONS}
            renderOption={renderMultiSelectOption}
          />

          <Text className="font-medium mb-2" size="sm">
            Notes
          </Text>
          <div className="min-h-40 w-full mb-4" ref={quillRef} />

          <div className={'horizontal-divider h-1 bg-primary-800'}></div>

          <div className="mt-4">
            <Text className="font-medium mb-2" size="sm">
              Images
            </Text>
            <ImageManager plant={data}></ImageManager>
          </div>

          <div className={'horizontal-divider h-1 bg-primary-800 mt-4'}></div>

          <div className="mt-4">
            <PlantLog
              logs={auditLogsQuery.data ?? []}
              isLoading={auditLogsQuery.isLoading}
            />
          </div>

          <div className={'horizontal-divider h-1 bg-primary-800 mt-4'}></div>

          <Text className="font-medium mb-2 mt-4" size="sm">
            Actions
          </Text>
          <Group justify={'flex-end'}>
            <Button
              color={'red'}
              onClick={() => deleteMutation.mutate(data!.id)}
            >
              Delete
            </Button>
          </Group>
        </Paper>
      </div>
    </div>
  );
}
