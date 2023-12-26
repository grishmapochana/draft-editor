import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";

import "draft-js/dist/Draft.css";

const styleMap = {
  RED: {
    color: "red",
  },
};

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", contentJSON);
  };

  const replaceText = (charToRemove) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = Modifier.replaceText(
      currentContent,
      selection.merge({
        anchorOffset: selection.getStartOffset() - charToRemove,
        focusOffset: selection.getStartOffset(),
      }),
      ""
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );
    return newEditorState;
  };

  const handleBeforeInput = () => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = currentContent.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (text.endsWith("# ") && selection.getStartOffset() === 2) {
      let newEditorState = replaceText(2);
      newEditorState = RichUtils.toggleBlockType(newEditorState, "header-one");
      setEditorState(newEditorState);
      return "handled";
    }

    if (text.endsWith("* ") && selection.getStartOffset() === 2) {
      let newEditorState = replaceText(2);
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
      setEditorState(newEditorState);
      return "handled";
    }

    if (text.endsWith("** ") && selection.getStartOffset() === 3) {
      let newEditorState = replaceText(3);
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "RED");
      setEditorState(newEditorState);
      return "handled";
    }

    if (text.endsWith("*** ") && selection.getStartOffset() === 4) {
      let newEditorState = replaceText(4);
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE");
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  return (
    <div className="min-h-screen my-10 mx-auto container">
      <div className="grid grid-cols-6">
        <div className="col-start-2 col-span-4 text-center text-xl my-auto ">
          Demo editor by Grishma
        </div>
        <div className="text-end">
          <button
            className="justify-end border-2 w-24 text-center border-green-600 rounded-lg px-3 py-1.5 text-green-400 cursor-pointer hover:bg-green-600 hover:text-green-200 my-auto"
            onClick={() => handleSave()}
          >
            Save
          </button>
        </div>
      </div>
      <div className="h-[70vh] overflow-y-auto border border-blue-500 mt-10 text-sm">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default CustomEditor;
