import addMath from '../modifiers/add_math';
import MathComponent, { MathProps } from '../entities/Math';
import { ComponentType } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';

export interface ImagePluginTheme {
  image?: string;
}

const defaultTheme: ImagePluginTheme = {};

export interface MathPluginConfig {
  theme?: ImagePluginTheme;
  mathComponent?: ComponentType<MathProps>;
  decorator?(component: ComponentType<MathProps>): ComponentType<MathProps>;
}

export type MathEditorPlugin = EditorPlugin & {
  addMath: typeof addMath;
};

export default (config: MathPluginConfig = {}): MathEditorPlugin => {
  const theme = config.theme ? config.theme : defaultTheme;
  let Image = config.mathComponent || MathComponent;
  if (config.decorator) {
    Image = config.decorator(Image);
  }
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const type = contentState.getEntity(entity).getType();
        if (type === 'MATH' || type === 'math') {
          return {
            component: MathComponent,
            editable: false,
          };
        }
        return null;
      }

      return null;
    },
    addMath,
  };
};

export const Image = MathComponent;
