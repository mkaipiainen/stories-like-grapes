import {Image, LoadingOverlay} from '@mantine/core';
import {trpc} from "@/src/util/trpc.ts";
import {FC} from "react";
export const S3Image: FC<{ id: string }> = (props) => {

	const { isLoading, data } = trpc.image.getS3Url.useQuery(props.id);

	return (
		<div className={'h-full'}>
			{isLoading ?
			<LoadingOverlay
				visible={true}
				zIndex={1000}
				overlayProps={{ radius: 'lg', blur: 2 }}
			></LoadingOverlay> : <Image className={'object-contain h-full'} src={data}></Image>}
		</div>
		)
}