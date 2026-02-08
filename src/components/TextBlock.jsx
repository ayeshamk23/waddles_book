import React, { useState, useRef, useEffect } from 'react';
import DraggableResizable from './DraggableResizable';

export default function TextBlock({
  id,
  x,
  y,
  width,
  height,
  text,
  fontFamily,
  color,
  fontSize = 16,
  onUpdate,
  onDelete,
  isSelected,
  pageBounds,
  onSelect,
  onEditStart,
  onEditEnd,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const textareaRef = useRef(null);
  const editingStateRef = useRef(isEditing);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (editingStateRef.current === isEditing) return;
    editingStateRef.current = isEditing;
    if (isEditing) {
      onEditStart?.();
    } else {
      onEditEnd?.();
    }
  }, [isEditing, onEditEnd, onEditStart]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText !== text) {
      onUpdate({ text: editText });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  };

  return (
    <DraggableResizable
      x={x}
      y={y}
      width={width}
      height={height}
      minWidth={50}
      minHeight={30}
      onUpdate={onUpdate}
      onDelete={onDelete}
      isSelected={isSelected}
      pageBounds={pageBounds}
    >
      <div
        className="w-full h-full p-2 outline-none"
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        style={{
          fontFamily,
          color,
          fontSize: `${fontSize}px`,
          wordWrap: 'break-word',
          overflow: 'hidden',
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none outline-none border-none bg-transparent"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontFamily,
              color,
              fontSize: `${fontSize}px`,
            }}
          />
        ) : (
          <div className="w-full h-full whitespace-pre-wrap break-words">
            {text || 'Double-click to edit'}
          </div>
        )}
      </div>
    </DraggableResizable>
  );
}
