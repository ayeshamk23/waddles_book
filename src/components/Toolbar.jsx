import React from 'react';
import { STICKER_OPTIONS } from './Sticker';

const FONT_OPTIONS = [
  { label: "Default (Poppins)", value: '"Poppins", sans-serif' },
  { label: "Patrick Hand", value: '"Patrick Hand", cursive' },
  { label: "Caveat", value: '"Caveat", cursive' },
  { label: "Dancing Script", value: '"Dancing Script", cursive' },
  { label: "Indie Flower", value: '"Indie Flower", cursive' },
  { label: "Shadows Into Light", value: '"Shadows Into Light", cursive' },
  { label: "Gloria Hallelujah", value: '"Gloria Hallelujah", cursive' },
  { label: "Short Stack", value: '"Short Stack", cursive' },
  { label: "Pixelify Sans", value: '"Pixelify Sans", monospace' },
  { label: "Press Start 2P", value: '"Press Start 2P", monospace' },
  { label: "VT323", value: '"VT323", monospace' },
];

export default function Toolbar({
  mode,
  onModeChange,
  onColorChange,
  onFontChange,
  onStickerSelect,
  onImageUpload,
  onMicClick,
  isListening,
  currentColor,
  currentFont,
  isAdmin = true,
  onZoomClick,
  isZoomed,
}) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a PNG or JPG image');
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg shadow-lg flex-wrap">
      {/* Text Mode Button */}
      <button
        onClick={() => onModeChange('text')}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          mode === 'text'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        }`}
      >
        Text
      </button>

      {/* Mic Button (Admin Only) */}
      {isAdmin && (
        <button
          onClick={onMicClick}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          🎤 {isListening ? 'Listening...' : 'Mic'}
        </button>
      )}

      {/* Color Picker */}
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="text-gray-200 font-semibold">Color:</span>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-10 rounded border-2 border-gray-600 cursor-pointer"
        />
      </label>

      {/* Font Picker */}
      <label className="flex items-center gap-2">
        <span className="text-gray-200 font-semibold">Font:</span>
        <select
          value={currentFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Sticker Picker */}
      <div className="flex items-center gap-2">
        <span className="text-gray-200 font-semibold">Stickers:</span>
        <div className="flex gap-1 flex-wrap">
          {STICKER_OPTIONS.slice(0, 8).map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onStickerSelect(sticker.id)}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-lg transition-colors"
              title={sticker.name}
            >
              {sticker.emoji}
            </button>
          ))}
          {STICKER_OPTIONS.length > 8 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onStickerSelect(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs"
            >
              <option value="">More...</option>
              {STICKER_OPTIONS.slice(8).map((sticker) => (
                <option key={sticker.id} value={sticker.id}>
                  {sticker.emoji} {sticker.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
          📷 Upload Image
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {/* Zoom Edit Mode */}
      <button
        onClick={onZoomClick}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          isZoomed
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        }`}
      >
        🔍 {isZoomed ? 'Exit Zoom' : 'Zoom Edit'}
      </button>
    </div>
  );
}
