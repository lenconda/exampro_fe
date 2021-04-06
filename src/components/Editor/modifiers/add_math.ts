import { EditorState, AtomicBlockUtils } from 'draft-js';

export default (
  editorState: EditorState,
  content: string,
  extraData: Record<string, unknown>,
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    'MATH',
    'IMMUTABLE',
    { ...extraData, content },
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(
    editorState,
    entityKey,
    ' ',
  );
  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter(),
  );
};
