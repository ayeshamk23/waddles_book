import React, { useEffect, useRef, useState } from "react";
import Page from "./Page";
import ZoomEditMode from "./ZoomEditMode";

const STORAGE_KEY = "diary-pages-v1";
const DEFAULT_PAGES = 3;
const DEFAULT_FONT = '"Poppins", sans-serif';
const DEFAULT_COLOR = "#000000";
const DEFAULT_TEXT_SIZE = 16;
const MIN_TEXT_SIZE = 10;
const MAX_TEXT_SIZE = 72;
const PAGE_BOUNDS = { width: 400, height: 500 };
const DELETE_ANIM_MS = 320;

const TOOL_KEYS = {
  SELECT: "select",
  TEXT: "text",
  STICKER: "sticker",
  IMAGE: "image",
};

const STICKERS = [
  {
    id: "star",
    label: "Star",
    src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpolygon points='40,6 50,30 76,30 54,46 62,72 40,58 18,72 26,46 4,30 30,30' fill='%23f7d154'/%3E%3C/svg%3E",
  },
  {
    id: "heart",
    label: "Heart",
    src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 68 L12 40 C3 31 6 16 20 14 C29 13 36 19 40 25 C44 19 51 13 60 14 C74 16 77 31 68 40 Z' fill='%23ff6b6b'/%3E%3C/svg%3E",
  },
  {
    id: "smile",
    label: "Smile",
    src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='30' fill='%23ffe18a'/%3E%3Ccircle cx='30' cy='35' r='4' fill='%23333333'/%3E%3Ccircle cx='50' cy='35' r='4' fill='%23333333'/%3E%3Cpath d='M28 48 Q40 60 52 48' stroke='%23333333' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
  },
  {
    id: "flower",
    label: "Flower",
    src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='10' fill='%23ffd166'/%3E%3Ccircle cx='40' cy='12' r='12' fill='%2390caf9'/%3E%3Ccircle cx='40' cy='68' r='12' fill='%2390caf9'/%3E%3Ccircle cx='12' cy='40' r='12' fill='%2390caf9'/%3E%3Ccircle cx='68' cy='40' r='12' fill='%2390caf9'/%3E%3Ccircle cx='20' cy='20' r='10' fill='%2390caf9'/%3E%3Ccircle cx='60' cy='20' r='10' fill='%2390caf9'/%3E%3Ccircle cx='20' cy='60' r='10' fill='%2390caf9'/%3E%3Ccircle cx='60' cy='60' r='10' fill='%2390caf9'/%3E%3C/svg%3E",
  },
];

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const stripHtml = (value) => value.replace(/<[^>]*>/g, "");

const createTextBlock = ({ x, y, font, color, text, fontSize, width, height }) => ({
  id: createId(),
  type: "text",
  x,
  y,
  w: width || 220,
  h: height || 90,
  text: text || "",
  font: font || DEFAULT_FONT,
  color: color || DEFAULT_COLOR,
  fontSize: fontSize || DEFAULT_TEXT_SIZE,
});

const createStickerBlock = ({ x, y, src }) => ({
  id: createId(),
  type: "sticker",
  x,
  y,
  w: 90,
  h: 90,
  src,
});

const createImageBlock = ({ x, y, src }) => ({
  id: createId(),
  type: "image",
  x,
  y,
  w: 180,
  h: 140,
  src,
});

const createEmptyPage = () => ({
  frontBlocks: [],
  backBlocks: [],
});

const normalizePages = (pages) =>
  pages.map((page) => ({
    frontBlocks: Array.isArray(page.frontBlocks) ? page.frontBlocks : [],
    backBlocks: Array.isArray(page.backBlocks) ? page.backBlocks : [],
  }));

const loadPages = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return normalizePages(parsed);
      }
    } catch {
      // ignore
    }
  }

  const legacyCount = parseInt(localStorage.getItem("page-count") || "", 10);
  const count = Number.isFinite(legacyCount) && legacyCount > 0 ? legacyCount : DEFAULT_PAGES;

  return Array.from({ length: count }, (_, index) => {
    const frontText = localStorage.getItem(`page-${index}-front`) || "";
    const backText = localStorage.getItem(`page-${index}-back`) || "";
    const frontColor = localStorage.getItem(`page-${index}-front-color`) || DEFAULT_COLOR;
    const backColor = localStorage.getItem(`page-${index}-back-color`) || DEFAULT_COLOR;
    const frontFont = localStorage.getItem(`page-${index}-front-font`) || DEFAULT_FONT;
    const backFont = localStorage.getItem(`page-${index}-back-font`) || DEFAULT_FONT;

    return {
      frontBlocks: frontText
        ? [
            createTextBlock({
              x: 0,
              y: 0,
              text: stripHtml(frontText),
              font: frontFont,
              color: frontColor,
            }),
          ]
        : [],
      backBlocks: backText
        ? [
            createTextBlock({
              x: 0,
              y: 0,
              text: stripHtml(backText),
              font: backFont,
              color: backColor,
            }),
          ]
        : [],
    };
  });
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function FlipBook() {
  const [pages, setPages] = useState(() => loadPages());
  const [current, setCurrent] = useState(0);
  const [isOpen] = useState(true);
  const [active, setActive] = useState({ index: 0, side: "front" });
  const activeRef = useRef(active);
  const [pageBounds, setPageBounds] = useState(PAGE_BOUNDS);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipTimerRef = useRef(null);
  const [flipDurationMs, setFlipDurationMs] = useState(500);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const deleteTimerRef = useRef(null);

  const [activeTool, setActiveTool] = useState(TOOL_KEYS.TEXT);
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);
  const [pendingImage, setPendingImage] = useState(null);
  const [fontFamily, setFontFamily] = useState(
    () => localStorage.getItem("tool-font") || DEFAULT_FONT
  );
  const [fontColor, setFontColor] = useState(
    () => localStorage.getItem("tool-color") || DEFAULT_COLOR
  );
  const [fontSize, setFontSize] = useState(() => {
    const stored = parseInt(localStorage.getItem("tool-font-size") || "", 10);
    return Number.isFinite(stored) ? stored : DEFAULT_TEXT_SIZE;
  });

  const [selectedBlock, setSelectedBlock] = useState(null);
  const selectedRef = useRef(selectedBlock);
  const [zoomMode, setZoomMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const shouldListenRef = useRef(false);
  const recognitionRef = useRef(null);
  const speechTargetRef = useRef(null);

  useEffect(() => {
    const parseDurationMs = (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return null;
      if (trimmed.endsWith("ms")) {
        const num = parseFloat(trimmed.replace("ms", ""));
        return Number.isFinite(num) ? num : null;
      }
      if (trimmed.endsWith("s")) {
        const num = parseFloat(trimmed.replace("s", ""));
        return Number.isFinite(num) ? num * 1000 : null;
      }
      const num = parseFloat(trimmed);
      return Number.isFinite(num) ? num : null;
    };

    const readPageBounds = () => {
      if (typeof window === "undefined") return PAGE_BOUNDS;
      const root = window.getComputedStyle(document.documentElement);
      const width = parseFloat(root.getPropertyValue("--page-width"));
      const height = parseFloat(root.getPropertyValue("--page-height"));
      if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
        return { width, height };
      }
      const pageEl = document.querySelector(".book .page");
      if (pageEl) {
        const rect = pageEl.getBoundingClientRect();
        if (rect.width && rect.height) {
          return { width: rect.width, height: rect.height };
        }
      }
      return PAGE_BOUNDS;
    };

    const updateBounds = () => {
      const next = readPageBounds();
      setPageBounds(next);
      const root = window.getComputedStyle(document.documentElement);
      const durationValue = root.getPropertyValue("--flip-duration");
      const parsed = parseDurationMs(durationValue);
      if (parsed && parsed > 0) {
        setFlipDurationMs(parsed);
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    selectedRef.current = selectedBlock;
  }, [selectedBlock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem("tool-font", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem("tool-color", fontColor);
  }, [fontColor]);

  useEffect(() => {
    localStorage.setItem("tool-font-size", String(fontSize));
  }, [fontSize]);

  const updateBlocks = (index, side, updater) => {
    setPages((prev) => {
      const next = [...prev];
      const page = { ...next[index] };
      const key = side === "front" ? "frontBlocks" : "backBlocks";
      page[key] = updater(page[key] || []);
      next[index] = page;
      return next;
    });
  };

  const addBlock = (index, side, block) => {
    updateBlocks(index, side, (blocks) => [...blocks, block]);
  };

  const updateBlock = (index, side, blockId, updates) => {
    updateBlocks(index, side, (blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
    );
  };

  const deleteBlock = (index, side, blockId) => {
    updateBlocks(index, side, (blocks) => blocks.filter((block) => block.id !== blockId));
    setSelectedBlock(null);
  };

  const getBlocksForSide = (index, side) => {
    const page = pages[index];
    if (!page) return [];
    return side === "front" ? page.frontBlocks : page.backBlocks;
  };

  const getBlockById = (index, side, blockId) => {
    return getBlocksForSide(index, side).find((block) => block.id === blockId);
  };

  const renderPreviewBlocks = (blocks) =>
    (blocks || []).map((block) => {
      const width = Number.isFinite(block.w)
        ? block.w
        : Number.isFinite(block.width)
          ? block.width
          : 120;
      const height = Number.isFinite(block.h)
        ? block.h
        : Number.isFinite(block.height)
          ? block.height
          : 80;
      const baseStyle = {
        left: `${block.x || 0}px`,
        top: `${block.y || 0}px`,
        width: `${width}px`,
        height: `${height}px`,
        position: "absolute",
        pointerEvents: "none",
      };

      if (block.type === "text") {
        return (
          <div
            key={block.id}
            style={{
              ...baseStyle,
              fontFamily: block.font || DEFAULT_FONT,
              fontSize: `${block.fontSize || DEFAULT_TEXT_SIZE}px`,
              color: block.color || DEFAULT_COLOR,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            {block.text}
          </div>
        );
      }

      return (
        <img
          key={block.id}
          src={block.src}
          alt={block.type === "image" ? "Uploaded" : "Sticker"}
          style={{
            ...baseStyle,
            objectFit: "contain",
          }}
          draggable={false}
        />
      );
    });

  const openEditMode = (index, side) => {
    if (!isOpen) return;
    setActive({ index, side });
    setSelectedBlock(null);
    setZoomMode(true);
  };

  const closeEditMode = () => {
    setZoomMode(false);
    setSelectedBlock(null);
  };

  const handlePageClick = (index, side) => {
    openEditMode(index, side);
  };

  const flipNext = () => {
    setCurrent((prev) => Math.min(prev + 1, pages.length - 1));
    setIsFlipping(true);
    setRemoveConfirmOpen(false);
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
    }, flipDurationMs);
  };

  const flipPrev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
    setIsFlipping(true);
    setRemoveConfirmOpen(false);
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
    }, flipDurationMs);
  };

  const addPage = () => {
    setPages((prev) => {
      const next = [...prev, createEmptyPage()];
      const nextIndex = next.length - 1;
      setCurrent(nextIndex);
      setIsFlipping(true);
      setRemoveConfirmOpen(false);
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      flipTimerRef.current = setTimeout(() => {
        setIsFlipping(false);
      }, flipDurationMs);
      return next;
    });
  };

  const requestRemovePage = () => {
    if (isDeletingPage) return;
    setRemoveConfirmOpen((prev) => !prev);
  };

  const cancelRemovePage = () => {
    if (isDeletingPage) return;
    setRemoveConfirmOpen(false);
  };

  const confirmRemovePage = () => {
    if (isDeletingPage) return;
    if (pages.length <= 1) {
      setRemoveConfirmOpen(false);
      return;
    }

    const targetIndex = current;
    setRemoveConfirmOpen(false);
    setDeletingIndex(targetIndex);
    setIsDeletingPage(true);

    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = setTimeout(() => {
      setPages((prev) => {
        if (prev.length <= 1) {
          return prev;
        }
        const next = prev.filter((_, idx) => idx !== targetIndex);
        const nextIndex = Math.max(0, Math.min(targetIndex - 1, next.length - 1));
        setCurrent(nextIndex);
        return next;
      });
      setIsDeletingPage(false);
      setDeletingIndex(null);
    }, DELETE_ANIM_MS);
  };

  const handleStickerSelect = (sticker) => {
    setSelectedSticker(sticker);
    setActiveTool(TOOL_KEYS.STICKER);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPendingImage(reader.result);
        setActiveTool(TOOL_KEYS.IMAGE);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const isAdmin = true;

  const ensureSpeechTarget = () => {
    const { index, side } = activeRef.current;
    const selected = selectedRef.current;
    let blockId = selected && selected.index === index && selected.side === side ? selected.id : null;
    let selectedBlock = blockId ? getBlockById(index, side, blockId) : null;

    if (!selectedBlock || selectedBlock.type !== "text") {
      const block = createTextBlock({
        x: 16,
        y: 16,
        font: fontFamily,
        color: fontColor,
        fontSize,
        width: pageBounds.width - 32,
        height: pageBounds.height - 32,
        text: "",
      });
      addBlock(index, side, block);
      blockId = block.id;
      selectedBlock = block;
      setSelectedBlock({ index, side, id: blockId });
    }

    if (!speechTargetRef.current || speechTargetRef.current.blockId !== blockId) {
      speechTargetRef.current = {
        index,
        side,
        blockId,
        baseText: selectedBlock?.text || "",
        interimText: "",
      };
    }

    return speechTargetRef.current;
  };

  const commitSpeechInterim = () => {
    const target = speechTargetRef.current;
    if (!target || !target.interimText) return;
    const committed = `${target.baseText} ${target.interimText}`.trim();
    target.baseText = committed;
    target.interimText = "";
    updateBlock(target.index, target.side, target.blockId, { text: committed });
  };

  const startSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech-to-text is not supported in this browser. Use Chrome.");
      return;
    }

    if (shouldListenRef.current) {
      shouldListenRef.current = false;
      setIsListening(false);
      commitSpeechInterim();
      speechTargetRef.current = null;
      recognitionRef.current?.stop();
      return;
    }

    shouldListenRef.current = true;
    setIsListening(true);
    ensureSpeechTarget();

    const rec = recognitionRef.current || new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const target = ensureSpeechTarget();
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0]?.transcript || "";
        } else {
          interimText += result[0]?.transcript || "";
        }
      }
      if (!target) return;
      let nextBase = target.baseText;
      const finalTrimmed = finalText.trim();
      const interimTrimmed = interimText.trim();
      if (finalTrimmed) {
        nextBase = `${nextBase} ${finalTrimmed}`.trim();
      }
      target.baseText = nextBase;
      target.interimText = interimTrimmed;
      updateBlock(target.index, target.side, target.blockId, {
        text: `${nextBase} ${interimTrimmed}`.trim(),
      });
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        commitSpeechInterim();
        setTimeout(() => {
          try {
            rec.start();
          } catch {
            // ignore
          }
        }, 150);
        return;
      }
      setIsListening(false);
    };

    rec.onerror = (event) => {
      if (shouldListenRef.current && event?.error !== "not-allowed") {
        commitSpeechInterim();
        setTimeout(() => {
          try {
            rec.start();
          } catch {
            // ignore
          }
        }, 300);
        return;
      }
      shouldListenRef.current = false;
      setIsListening(false);
      speechTargetRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // ignore
    }
  };

  const handleFontSizeChange = (nextSize) => {
    const size = clamp(nextSize, MIN_TEXT_SIZE, MAX_TEXT_SIZE);
    setFontSize(size);

    const selected = selectedRef.current;
    if (!selected) return;
    const block = getBlockById(selected.index, selected.side, selected.id);
    if (block && block.type === "text") {
      updateBlock(selected.index, selected.side, selected.id, { fontSize: size });
    }
  };

  const handleFontColorChange = (value) => {
    setFontColor(value);
    const selected = selectedRef.current;
    if (!selected) return;
    const block = getBlockById(selected.index, selected.side, selected.id);
    if (block && block.type === "text") {
      updateBlock(selected.index, selected.side, selected.id, { color: value });
    }
  };

  const handleFontFamilyChange = (value) => {
    setFontFamily(value);
    const selected = selectedRef.current;
    if (!selected) return;
    const block = getBlockById(selected.index, selected.side, selected.id);
    if (block && block.type === "text") {
      updateBlock(selected.index, selected.side, selected.id, { font: value });
    }
  };

  const activeStickerId = selectedSticker?.id;

  const renderToolbar = () => (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-white/10 p-3 flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
            activeTool === TOOL_KEYS.TEXT
              ? "bg-white text-slate-900"
              : "bg-slate-700 text-white"
          }`}
          onClick={() => setActiveTool(TOOL_KEYS.TEXT)}
        >
          Text
        </button>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
            activeTool === TOOL_KEYS.SELECT
              ? "bg-white text-slate-900"
              : "bg-slate-700 text-white"
          }`}
          onClick={() => setActiveTool(TOOL_KEYS.SELECT)}
        >
          Select
        </button>
        {isAdmin && (
          <button
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              isListening ? "bg-emerald-400 text-slate-900" : "bg-slate-700 text-white"
            }`}
            onClick={startSpeechToText}
          >
            {isListening ? "Listening…" : "Mic"}
          </button>
        )}
        <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-2 rounded-lg">
          <span className="text-xs text-slate-200">Font</span>
          <select
            className="bg-slate-700 text-white text-sm rounded-md px-2 py-1"
            value={fontFamily}
            onChange={(event) => handleFontFamilyChange(event.target.value)}
          >
            <option value={DEFAULT_FONT}>Default (Poppins)</option>
            <option value='"Patrick Hand", cursive'>Patrick Hand</option>
            <option value='"Caveat", cursive'>Caveat</option>
            <option value='"Dancing Script", cursive'>Dancing Script</option>
            <option value='"Indie Flower", cursive'>Indie Flower</option>
            <option value='"Shadows Into Light", cursive'>Shadows Into Light</option>
            <option value='"Gloria Hallelujah", cursive'>Gloria Hallelujah</option>
            <option value='"Short Stack", cursive'>Short Stack</option>
            <option value='"Pixelify Sans", monospace'>Pixelify Sans</option>
            <option value='"Press Start 2P", monospace'>Press Start 2P</option>
            <option value='"VT323", monospace'>VT323</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-2 rounded-lg">
          <span className="text-xs text-slate-200">Size</span>
          <button
            className="h-7 w-7 rounded bg-slate-700 text-white text-sm"
            onClick={() => handleFontSizeChange(fontSize - 2)}
          >
            -
          </button>
          <input
            type="number"
            min={MIN_TEXT_SIZE}
            max={MAX_TEXT_SIZE}
            value={fontSize}
            onChange={(event) => handleFontSizeChange(parseInt(event.target.value || "0", 10))}
            className="w-14 bg-slate-700 text-white text-sm rounded-md px-2 py-1 text-center"
          />
          <button
            className="h-7 w-7 rounded bg-slate-700 text-white text-sm"
            onClick={() => handleFontSizeChange(fontSize + 2)}
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-2 rounded-lg">
          <span className="text-xs text-slate-200">Color</span>
          <input
            type="color"
            value={fontColor}
            onChange={(event) => handleFontColorChange(event.target.value)}
            className="h-8 w-8 rounded border-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-200">Stickers</span>
          <div className="flex gap-2">
            {STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerSelect(sticker)}
                className={`h-10 w-10 rounded-lg border transition ${
                  activeTool === TOOL_KEYS.STICKER && activeStickerId === sticker.id
                    ? "border-emerald-400"
                    : "border-white/10"
                }`}
              >
                <img src={sticker.src} alt={sticker.label} className="h-9 w-9 object-contain" />
              </button>
            ))}
          </div>
        </div>
        <label className="inline-flex items-center gap-2 bg-slate-700 text-white text-sm font-semibold px-3 py-2 rounded-lg cursor-pointer">
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  const renderReadingControls = () => (
    <div className="w-full max-w-6xl flex items-center justify-between">
      <div className="text-sm text-slate-200">
        {"Reading Mode"} · Page {current + 1} of {pages.length}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-700 text-white"
          onClick={addPage}
        >
          Add Page
        </button>
        <div className="relative">
          <button
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-700 text-white"
            onClick={requestRemovePage}
          >
            Remove Page
          </button>
          {removeConfirmOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg bg-slate-900/95 border border-white/10 p-3 text-xs text-slate-100 shadow-xl z-50">
              <div className="mb-2">Remove this page?</div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-2 py-1 rounded-md bg-rose-500 text-white font-semibold"
                  onClick={confirmRemovePage}
                >
                  Remove
                </button>
                <button
                  className="flex-1 px-2 py-1 rounded-md bg-slate-700 text-white font-semibold"
                  onClick={cancelRemovePage}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl flex flex-col items-center gap-4">
      {renderReadingControls()}

      <div className="relative">
        <div className={`book ${isOpen ? "open" : ""} ${isFlipping ? "flipping" : ""}`}>
          {isOpen && current > 0 && !zoomMode && (
            <div className="left-overlay" aria-hidden="true">
              <div className="page-editor">
                {renderPreviewBlocks(pages[current - 1]?.backBlocks)}
              </div>
            </div>
          )}
          {isOpen && !zoomMode && (
            <>
              <div
                className="spread-hit left"
                onClick={() => {
                  if (current > 0) {
                    openEditMode(current - 1, "back");
                  }
                }}
              />
              <div
                className="spread-hit right"
                onClick={() => openEditMode(current, "front")}
              />
            </>
          )}
          <div className="cover">
            <div className="cover-content">
              <span className="cover-title">Diary</span>
              <span className="cover-subtitle">Book</span>
            </div>
          </div>
          <div className="back-cover" />
          {isOpen && current > 0 && (
            <button className="nav prev book-nav" onClick={flipPrev} aria-label="Previous page">
              ‹
            </button>
          )}
          {isOpen && current < pages.length - 1 && (
            <button className="nav next book-nav" onClick={flipNext} aria-label="Next page">
              ›
            </button>
          )}

          {pages.map((page, index) => (
            <Page
              key={index}
              index={index}
              current={current}
              frontBlocks={page.frontBlocks}
              backBlocks={page.backBlocks}
              isOpen={isOpen}
              onPageClick={handlePageClick}
              isDeleting={isDeletingPage && deletingIndex === index}
            />
          ))}
        </div>
      </div>

      {zoomMode && (() => {
        const blocks = getBlocksForSide(active.index, active.side);
        const content = blocks
          .map((block) => {
            if (block.type === "text") {
              return {
                id: block.id,
                type: "text",
                x: block.x,
                y: block.y,
                width: block.w,
                height: block.h,
                text: block.text || "",
                fontFamily: block.font || fontFamily,
                color: block.color || fontColor,
                fontSize: block.fontSize || DEFAULT_TEXT_SIZE,
              };
            }
            if (block.type === "sticker") {
              const matchedSticker = STICKERS.find((sticker) => sticker.src === block.src);
              return {
                id: block.id,
                type: "sticker",
                x: block.x,
                y: block.y,
                width: block.w,
                height: block.h,
                stickerId: matchedSticker?.id || "custom",
                src: block.src,
              };
            }
            if (block.type === "image") {
              return {
                id: block.id,
                type: "image",
                x: block.x,
                y: block.y,
                width: block.w,
                height: block.h,
                src: block.src,
              };
            }
            return null;
          })
          .filter(Boolean);

        return (
          <ZoomEditMode
            pageIndex={active.index}
            side={active.side}
            content={content}
            onContentUpdate={(newContent) => {
              const newBlocks = newContent
                .map((item) => {
                  if (item.type === "text") {
                    return {
                      id: item.id,
                      type: "text",
                      x: item.x,
                      y: item.y,
                      w: item.width,
                      h: item.height,
                      text: item.text,
                      font: item.fontFamily,
                      color: item.color,
                      fontSize: item.fontSize,
                    };
                  }
                  if (item.type === "sticker") {
                    const fallbackSrc =
                      STICKERS.find((sticker) => sticker.id === item.stickerId)?.src ||
                      STICKERS[0].src;
                    return {
                      id: item.id,
                      type: "sticker",
                      x: item.x,
                      y: item.y,
                      w: item.width,
                      h: item.height,
                      src: item.src || fallbackSrc,
                    };
                  }
                  if (item.type === "image") {
                    return {
                      id: item.id,
                      type: "image",
                      x: item.x,
                      y: item.y,
                      w: item.width,
                      h: item.height,
                      src: item.src,
                    };
                  }
                  return null;
                })
                .filter(Boolean);

              setPages((prev) => {
                const next = [...prev];
                const page = { ...next[active.index] };
                const key = active.side === "front" ? "frontBlocks" : "backBlocks";
                page[key] = newBlocks;
                next[active.index] = page;
                return next;
              });
            }}
            selectedId={selectedBlock?.id || null}
            onSelect={(id) => {
              if (!id) {
                setSelectedBlock(null);
                return;
              }
              setSelectedBlock({ index: active.index, side: active.side, id });
            }}
            fontFamily={fontFamily}
            color={fontColor}
            fontSize={fontSize}
            onClose={closeEditMode}
    pageBounds={pageBounds}
            mode={activeTool}
            onAddItem={(type, data) => {
              const { index, side } = activeRef.current;
              if (type === "text") {
                const block = createTextBlock({
                  x: data.x,
                  y: data.y,
                  font: fontFamily,
                  color: fontColor,
                  fontSize,
                });
                addBlock(index, side, block);
                setSelectedBlock({ index, side, id: block.id });
                return;
              }
              if (type === "sticker") {
                if (!selectedSticker) return;
                const block = createStickerBlock({
                  x: data.x,
                  y: data.y,
                  src: selectedSticker.src,
                });
                addBlock(index, side, block);
                setSelectedBlock({ index, side, id: block.id });
                return;
              }
              if (type === "image") {
                if (!pendingImage) return;
                const block = createImageBlock({
                  x: data.x,
                  y: data.y,
                  src: pendingImage,
                });
                addBlock(index, side, block);
                setSelectedBlock({ index, side, id: block.id });
                setPendingImage(null);
                setActiveTool(TOOL_KEYS.SELECT);
              }
            }}
            toolbar={renderToolbar()}
          />
        );
      })()}
    </div>
  );
}
