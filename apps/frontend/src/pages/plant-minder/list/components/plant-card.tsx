import {ActionIcon, Badge, Card, Group, Image, LoadingOverlay, Text} from "@mantine/core";
import {S3Image} from "@/src/components/s3-image.tsx";
import {Link} from "react-router-dom";
import {PlantWithTagsAndImages} from "@api/src/db/types/plant";
import {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDroplet, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {trpc} from "@/src/util/trpc.ts";
import plantPlaceholder from '@/src/assets/plant-placeholder.webp';
import worriedPlantPlaceholder from '@/src/assets/plant-placeholder-worried.webp';
import angryPlantPlaceholder from '@/src/assets/plant-placeholder-angry.webp';
import {TAGS} from "@/src/constants/tags.ts";
import dayjs from "dayjs";
import {match} from "ts-pattern";
import {useDissolve} from "@/src/hooks/dissolve/use-dissolve.tsx";
export function PlantCard(props: {
	plant: PlantWithTagsAndImages
}) {
	const card = useRef<HTMLDivElement>(null);
	const dissolve = useDissolve();
	const [seed] = useState(Math.ceil(Math.random() * 1000))
	const filterId = `filter-${props.plant.id}`;
	const trpcContext = trpc.useUtils();
	const [daysUntilWatering, setDaysUntilWatering] = useState<number>(0);
	const [daysSinceWatering, setDaysSinceWatering] = useState<number>(0);
	const [plantPlaceholderImage, setPlantPlaceholderImage] = useState(plantPlaceholder);
	const [mood, setMood] = useState<'normal'  | 'worried' | 'angry'>(daysSinceWatering <= 0 ? 'normal' : (daysSinceWatering > 0 && daysSinceWatering < 3 ? 'worried' : 'angry'));
	useEffect(() => {
		setMood(daysSinceWatering === 0 ? 'normal' : (daysSinceWatering > 0 && daysSinceWatering < 3 ? 'worried' : 'angry'));
	}, [daysSinceWatering]);

	useEffect(() => {
		setPlantPlaceholderImage(match(mood).with('normal', () => {
			return plantPlaceholder
		}).with('worried', () => {
			return worriedPlantPlaceholder
		}).with('angry', () => {
			return angryPlantPlaceholder
		}).exhaustive())
	}, [mood]);
	useEffect(() => {
		const dayDifference = dayjs(props.plant.next_watering_date).diff(dayjs(new Date()), 'day');
		setDaysUntilWatering(dayDifference);
		setDaysSinceWatering(dayDifference > 0 ? 0 : Math.abs(dayDifference));
	}, [props.plant.next_watering_date]);

	const doWaterMutation = trpc.plant.water.useMutation({
		onSettled: () => {
			trpcContext.plant.list.invalidate();
		}
	});
	const deleteMutation = trpc.plant.delete.useMutation({
		onMutate: async (id: string) => {
			if(card.current) {
				await dissolve({
					element: card.current
				})
			}
			await trpcContext.plant.list.cancel(); // Cancel any ongoing fetch for `list`
			const previousData = trpcContext.plant.list.getData();

			trpcContext.plant.list.setData(
				undefined, // Use the same arguments as the original query
				(oldData) => oldData?.filter((plant) => plant.id !== id) ?? []
			);

			return { previousData };
		},
		onError: (_err, _id, context) => {
			if (context?.previousData) {
				trpcContext.plant.list.setData(undefined, context.previousData);
			}
		},
		onSettled: async () => {
			if(card.current) {
				await dissolve({
					element: card.current
				})
				await trpcContext.plant.list.invalidate();
			} else {
				await trpcContext.plant.list.invalidate();
			}
		}
	});

	function onDelete() {
		deleteMutation.mutate(props.plant.id)
	}

	function onDoWater() {
		doWaterMutation.mutate(props.plant.id);
	}

	function getCardClass() {
		const mood = daysSinceWatering === 0 ? 'normal' : (daysSinceWatering > 0 && daysSinceWatering < 3 ? 'worried' : 'angry');

		return `flex items-center justify-center relative w-80 h-80 m-4 ${mood}`;
	}


	return (
		<div className={getCardClass()} ref={card}>
			{deleteMutation.isLoading ? <LoadingOverlay
				visible={true}
				zIndex={1000}
				overlayProps={{ radius: 'lg', blur: 2 }}
				pos={'absolute'}></LoadingOverlay> : <></>}
			<ActionIcon color={'green'} onClick={() => onDoWater()} className={'shadow-action shadow-primary-foreground absolute top-0 -left-0.5 z-10'} variant="filled" size="lg" radius="xl" aria-label="Delete">
				<FontAwesomeIcon size={'lg'} color={'white'} icon={faDroplet}></FontAwesomeIcon>
			</ActionIcon>
			<ActionIcon className={'shadow-action shadow-primary-foreground absolute top-0 -right-0.5 z-10'} variant="filled" size="lg" radius="xl" aria-label="Edit">
				<Link
					to={{
						pathname: `/plant-minder/detail/${props.plant.id}`,
					}}
				>
					<FontAwesomeIcon color={'white'} icon={faEdit}></FontAwesomeIcon>
				</Link>
			</ActionIcon>
			<ActionIcon color={'red'} onClick={() => onDelete()} className={'shadow-action shadow-primary-foreground absolute top-12 -right-0.5 z-10'} variant="filled" size="lg" radius="xl" aria-label="Delete">
					<FontAwesomeIcon color={'white'} icon={faTrash}></FontAwesomeIcon>
			</ActionIcon>
			<Card
				className={'w-80 h-80 m-4 border-none box-border items-center'}
				shadow="sm"
				padding="lg"
				radius="md"
				withBorder
				style={{filter: `url(#${filterId}) drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.2))`}}
			>

				<Card.Section className={'flex-grow basis-1/2 h-1/2 max-h-1/2 w-full'}>
					{props.plant.images.length ? <S3Image id={props.plant.images[0]?.id}></S3Image> : <Image
						src={plantPlaceholderImage}
						height={160}
						alt="Plant image placeholder"
						className={'h-full object-contain'}
					/>}
				</Card.Section>
				<Card.Section className={'flex-grow basis-1/2 h-1/2 max-h-1/2 w-full'}>

					<Group justify="space-between" mt="md" mb="xs">
						<Text fw={500}>{props.plant.name}</Text>
					</Group>
					{props.plant.tags.length ?(
							<>
								<div className={'horizontal-divider bg-primary-800'}></div>

								<Group justify="space-between" mt="md" mb="xs">
									{props.plant.tags.map((tag) => (
										<Badge key={tag.name} color="pink">
											<Group className={'flex justify-between flex-nowrap'}>
												<FontAwesomeIcon icon={TAGS[tag.name].icon}></FontAwesomeIcon>
												<Text size={'xs'}>{tag.name}</Text>
											</Group>

										</Badge>
									))}
								</Group>
							</>

						)
						: <></>}

					<div className={'horizontal-divider bg-primary-800'}></div>

					{daysUntilWatering > 0 ?
						<Text size={'xs'}>Water in {daysUntilWatering} days</Text>
						:
						<Text size={'xs'}><span className={'text-danger font-bold'}>Water today! {daysSinceWatering > 0 ? `(${daysSinceWatering} days overdue)` : ''}</span></Text>
					}
				</Card.Section>

			</Card>
			<svg className={'w-0 h-0 fixed'} width="200" height="200" xmlns="http://www.w3.org/2000/svg">
			<defs>
					<filter id={filterId} x="0" y="0" width="200%" height="200%">
						<feTurbulence seed={seed} type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="turbulence"/>

						<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilated"/>
						<feMorphology in="SourceAlpha" operator="erode" radius="5" result="eroded"/>
						<feComposite in="dilated" in2="eroded" operator="xor" result="edge-mask"/>

						<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="20" xChannelSelector="R" yChannelSelector="G"
															 result="displaced"/>

						<feComposite in="displaced" in2="edge-mask" operator="in" result="edges-only"/>
						<feComposite in="SourceGraphic" in2="edges-only" operator="over"/>
					</filter>
				</defs>
			</svg>
		</div>

)
}