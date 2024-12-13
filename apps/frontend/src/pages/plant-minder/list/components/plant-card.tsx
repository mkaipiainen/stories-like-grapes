import {ActionIcon, Badge, Card, Group, Image, LoadingOverlay, Text} from "@mantine/core";
import {S3Image} from "@/src/components/s3-image.tsx";
import {Link} from "react-router-dom";
import {Plant} from "@api/src/db/types/plant";
import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {trpc} from "@/src/util/trpc.ts";

export function PlantCard(props: {
	plant: Plant
}) {
	const [seed] = useState(Math.ceil(Math.random() * 1000))
	const filterId = `filter-${props.plant.id}`;
	const trpcContext = trpc.useUtils();

	const deleteMutation = trpc.plant.delete.useMutation({
		onMutate: async (id: string) => {
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
		onSettled: () => {
			trpcContext.plant.list.invalidate();
		}
	});


	return (
		<div className={'flex items-center justify-center relative w-80 h-80 m-4'}>
			{deleteMutation.isLoading ? <LoadingOverlay
				visible={true}
				zIndex={1000}
				overlayProps={{ radius: 'lg', blur: 2 }}
				pos={'absolute'}></LoadingOverlay> : <></>}
			<ActionIcon className={'absolute -top-4 -right-0.5 z-10'} variant="filled" size="lg" radius="xl" aria-label="Edit">
				<Link
					to={{
						pathname: `/plant-minder/detail/${props.plant.id}`,
					}}
				>
					<FontAwesomeIcon color={'white'} icon={faEdit}></FontAwesomeIcon>
				</Link>
			</ActionIcon>
			<ActionIcon onClick={() => deleteMutation.mutate(props.plant.id)} className={'absolute -top-4 -left-0.5 z-10'} variant="filled" size="lg" radius="xl" aria-label="Delete">
					<FontAwesomeIcon color={'white'} icon={faTrash}></FontAwesomeIcon>
			</ActionIcon>
			<Card
				className={'w-80 h-80 m-4 border-none box-border'}
				shadow="sm"
				padding="lg"
				radius="md"
				withBorder
				style={{filter: `url(#${filterId}) drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.2))`}}
			>

				<Card.Section className={'flex-grow basis-1/2 h-1/2 max-h-1/2'}>
					{props.plant.images.length ? <S3Image id={props.plant.images[0]?.id}></S3Image> : <Image
						src="/plant-placeholder.webp"
						height={160}
						alt="Plant image placeholder"
						className={'h-full object-contain'}
					/>}
				</Card.Section>
				<Card.Section className={'flex-grow basis-1/2 h-1/2 max-h-1/2'}>

					<Group justify="space-between" mt="md" mb="xs">
						<Text fw={500}>{props.plant.name}</Text>
					</Group>

					<Group justify="space-between" mt="md" mb="xs">
						{props.plant.tags.map((tag) => (
							<Badge color="pink">{tag.name}</Badge>
						))}
					</Group>
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