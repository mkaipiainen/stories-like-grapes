import {Image, LoadingOverlay} from '@mantine/core';
import {trpc} from "@/src/util/trpc.ts";
export function S3Image(props: {
	id: string
}) {

	const { isLoading, data } = trpc.image.getS3Url.useQuery(props.id);

	return (
		<>
			{isLoading ?
			<LoadingOverlay
				visible={true}
				zIndex={1000}
				overlayProps={{ radius: 'lg', blur: 2 }}
			></LoadingOverlay> : <Image src={data}></Image>}
		</>
		)
}