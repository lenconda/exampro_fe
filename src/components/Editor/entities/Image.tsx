import { ImagePluginTheme } from '../plugins/upload_image';
import React, { ImgHTMLAttributes, ReactElement } from 'react';
import { ContentBlock, ContentState } from 'draft-js';
import clsx from 'clsx';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  block: ContentBlock;
  className?: string;
  theme?: ImagePluginTheme;
  contentState: ContentState;

  // removed props
  blockStyleFn: unknown;
  blockProps: unknown;
  customStyleMap: unknown;
  customStyleFn: unknown;
  decorator: unknown;
  forceSelection: unknown;
  offsetKey: unknown;
  selection: unknown;
  tree: unknown;
  preventScroll: unknown;
}

const Image: React.FC<ImageProps> = React.forwardRef((props, ref) => {
  const { block, className, theme = {}, ...otherProps } = props;
  // leveraging destructuring to omit certain properties from props
  const {
    blockProps, // eslint-disable-line @typescript-eslint/no-unused-vars
    customStyleMap, // eslint-disable-line @typescript-eslint/no-unused-vars
    customStyleFn, // eslint-disable-line @typescript-eslint/no-unused-vars
    decorator, // eslint-disable-line @typescript-eslint/no-unused-vars
    forceSelection, // eslint-disable-line @typescript-eslint/no-unused-vars
    offsetKey, // eslint-disable-line @typescript-eslint/no-unused-vars
    selection, // eslint-disable-line @typescript-eslint/no-unused-vars
    tree, // eslint-disable-line @typescript-eslint/no-unused-vars
    blockStyleFn, // eslint-disable-line @typescript-eslint/no-unused-vars
    preventScroll, // eslint-disable-line @typescript-eslint/no-unused-vars
    contentState,
    ...elementProps
  } = otherProps;
  const combinedClassName = clsx(theme.image, className);
  const { src } = contentState.getEntity(block.getEntityAt(0)).getData();
  return (
    <img
      {...elementProps}
      ref={ref as any}
      src={src}
      role="presentation"
      className={combinedClassName}
    />
  );
});

export default Image;
