import React from 'react';
import PageCanvas from './PageCanvas';

export default function ZoomEditMode({
  pageIndex,
  side,
  content,
  onContentUpdate,
  selectedId,
  onSelect,
  fontFamily,
  color,
  fontSize,
  onClose,
  pageBounds,
  mode,
  onAddItem,
  toolbar,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full h-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-800 p-4 flex justify-between items-center z-10 rounded-t-lg">
          <h2 className="text-white font-semibold text-lg">
            Editing Page {pageIndex + 1} - {side === 'front' ? 'Front' : 'Back'}
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Book
          </button>
        </div>
        {toolbar && (
          <div className="sticky top-[64px] z-10 bg-gray-900/95 backdrop-blur px-4 py-3">
            {toolbar}
          </div>
        )}
        <div className="p-8" style={{ minHeight: 'calc(90vh - 80px)' }}>
          <div
            className="bg-white mx-auto shadow-lg"
            style={{
              width: pageBounds?.width || 400,
              height: pageBounds?.height || 500,
              position: 'relative',
            }}
          >
            <PageCanvas
              content={content}
              onContentUpdate={onContentUpdate}
              selectedId={selectedId}
              onSelect={onSelect}
              fontFamily={fontFamily}
              color={color}
              fontSize={fontSize}
              pageBounds={pageBounds}
              isEditable={true}
              mode={mode}
              onAddItem={onAddItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
