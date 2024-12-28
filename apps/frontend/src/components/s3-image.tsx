import { Image, LoadingOverlay } from '@mantine/core';
import { trpc } from '@/src/util/trpc.ts';
import { FC, MutableRefObject } from 'react';
export const S3Image: FC<{
  id: string | undefined;
  className?: string;
  style?: Record<string, any>;
  onClick?: () => void;
  ref?: MutableRefObject<any>;
}> = (props) => {
  const { isLoading, data } = trpc.image.getS3Url.useQuery(props.id ?? '');

  function onClick() {
    if (props.onClick) {
      props.onClick();
    }
  }
  return (
    <div className={' ' + (props.className ?? '')} style={props.style ?? {}}>
      {isLoading ? (
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
        ></LoadingOverlay>
      ) : (
        <Image
          onClick={onClick}
          className={'object-cover h-full'}
          src={data}
        ></Image>
      )}
    </div>
  );
};
