import React from 'react';
import { ContentBlock, ContentState } from 'draft-js';
import { BlockMath } from 'react-katex';

export interface MathProps {
  block: ContentBlock;
  contentState: ContentState;
}

const Math: React.FC<MathProps> = React.forwardRef((props, ref) => {
  const { contentState, block } = props;
  const { content } = contentState.getEntity(block.getEntityAt(0)).getData();
  return (
    <BlockMath>{content}</BlockMath>
  );
});

export default Math;
