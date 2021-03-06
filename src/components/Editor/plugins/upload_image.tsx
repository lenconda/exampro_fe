import addImage from '../modifiers/add_image';
import ImageComponent, { ImageProps } from '../entities/Image';
import React, { ComponentType, ReactElement } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';

export interface ImagePluginTheme {
  image?: string;
}

const defaultTheme: ImagePluginTheme = {};

export interface ImagePluginConfig {
  theme?: ImagePluginTheme;
  imageComponent?: ComponentType<ImageProps>;
  decorator?(component: ComponentType<ImageProps>): ComponentType<ImageProps>;
}

export type ImageEditorPlugin = EditorPlugin & {
  addImage: typeof addImage;
};

export default (config: ImagePluginConfig = {}): ImageEditorPlugin => {
  const theme = config.theme ? config.theme : defaultTheme;
  let Image = config.imageComponent || ImageComponent;
  if (config.decorator) {
    Image = config.decorator(Image);
  }
  const ThemedImage = (props: ImageProps): ReactElement => (
    <Image {...props} theme={theme} />
  );
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const type = contentState.getEntity(entity).getType();
        if (type === 'IMAGE' || type === 'image') {
          return {
            component: ThemedImage,
            editable: false,
          };
        }
        return null;
      }

      return null;
    },
    addImage,
  };
};

export const Image = ImageComponent;
