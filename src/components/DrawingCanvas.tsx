import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pen, Palette, RotateCcw, Eraser, PaintBucket } from "lucide-react";

export interface DrawingCanvasProps {
  isDrawing: boolean;
  word: String;
}

export const DrawingCanvas = ({ isDrawing, word }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "fill">(
    "pen"
  );
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showBrushSizes, setShowBrushSizes] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [showPallete, setShowPallete] = useState(false);
  const paletteBtnRef = useRef<HTMLButtonElement>(null);
  const paletteMenuRef = useRef<HTMLDivElement>(null);
  const brushBtnRef = useRef<HTMLButtonElement>(null);
  const brushMenuRef = useRef<HTMLDivElement>(null);
  const eraserBtnRef = useRef<HTMLButtonElement>(null);
  const eraserMenuRef = useRef<HTMLDivElement>(null);
  // Combined click-away handler for palette, brush, and eraser popups
  useEffect(() => {
    const popups: [
      boolean,
      React.Dispatch<React.SetStateAction<boolean>>,
      React.RefObject<HTMLButtonElement>,
      React.RefObject<HTMLDivElement>
    ][] = [
      [showPallete, setShowPallete, paletteBtnRef, paletteMenuRef],
      [showBrushSizes, setShowBrushSizes, brushBtnRef, brushMenuRef],
      [showEraserSizes, setShowEraserSizes, eraserBtnRef, eraserMenuRef],
    ];
    // Only add listener if any popup is open
    if (!popups.some(([open]) => open)) return;
    function handleClick(e: MouseEvent) {
      popups.forEach(([open, setOpen, btnRef, menuRef]) => {
        if (!open) return;
        const btn = btnRef.current;
        const menu = menuRef.current;
        if (
          menu &&
          !menu.contains(e.target as Node) &&
          btn &&
          !btn.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      });
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPallete, showBrushSizes, showEraserSizes]);

  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#90EE90",
    "#FFB6C1",
  ];

  // Only run once on mount: set up canvas size and white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 800;
    canvas.height = 500;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Update drawing properties when color or brush size changes (for pen only)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
  }, [currentColor, brushSize]);
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoords(e);

    setIsMouseDown(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (currentTool === "fill") {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Helper to get pixel index
      function getPixelIndex(x: number, y: number) {
        return (y * canvas.width + x) * 4;
      }

      // Get target color at clicked point
      const startIdx = getPixelIndex(Math.floor(x), Math.floor(y));
      const targetColor = data.slice(startIdx, startIdx + 4);
      const fillColor = [
        parseInt(currentColor.slice(1, 3), 16),
        parseInt(currentColor.slice(3, 5), 16),
        parseInt(currentColor.slice(5, 7), 16),
        255,
      ];

      if (
        targetColor[0] === fillColor[0] &&
        targetColor[1] === fillColor[1] &&
        targetColor[2] === fillColor[2] &&
        targetColor[3] === fillColor[3]
      ) {
        return; // Already filled
      }

      // Flood fill algorithm (stack-based)
      const stack = [[Math.floor(x), Math.floor(y)]];
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const idx = getPixelIndex(cx, cy);
        if (
          cx >= 0 &&
          cy >= 0 &&
          cx < canvas.width &&
          cy < canvas.height &&
          data[idx] === targetColor[0] &&
          data[idx + 1] === targetColor[1] &&
          data[idx + 2] === targetColor[2] &&
          data[idx + 3] === targetColor[3]
        ) {
          data[idx] = fillColor[0];
          data[idx + 1] = fillColor[1];
          data[idx + 2] = fillColor[2];
          data[idx + 3] = fillColor[3];
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMouseDown) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (currentTool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, eraserSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsMouseDown(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <Card className="p-2 bg-game-surface border-primary/20">
      <div className="flex mb-2 justify-center items-center w-full">
        {isDrawing && word && (
          <p className="text-3xl font-bold text-primary">{word}</p>
        )}
        {!isDrawing && word && (
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-3xl font-bold text-primary">
              {Array.from(word)
                .map(() => "_")
                .join(" ")}
            </p>
          </div>
        )}
      </div>
      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className={`border-2 border-border rounded-lg bg-white ${
            isDrawing ? "cursor-crosshair" : "cursor-not-allowed"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {/* Tool Bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-background/10 rounded-lg">
        {/* Drawing Tools */}
        <div className="flex gap-2">
          <div className="relative">
            <Button
              ref={brushBtnRef}
              variant={currentTool === "pen" ? "game" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentTool("pen");
                if (isDrawing) setShowBrushSizes((prev) => !prev);
              }}
              disabled={!isDrawing}
            >
              <Pen className="w-4 h-4" />
            </Button>
            {showBrushSizes && isDrawing && currentTool === "pen" && (
              <div
                ref={brushMenuRef}
                className="absolute bottom-full left-1/2 -translate-x-1/2 ml-2 flex flex-col gap-1 bg-background/90  p-2 rounded shadow-lg z-10 border border-border"
              >
                {[5, 10, 14, 17, 21, 25].map((size) => (
                  <span
                    key={size}
                    role="button"
                    tabIndex={0}
                    aria-label={`Brush size ${size}`}
                    className={`flex items-center justify-center cursor-pointer transition-all "border-border hover:border-primary/50"`}
                    style={{
                      height: 28,
                      width: 28,
                      outline: "none",
                    }}
                    onClick={() => {
                      setBrushSize(size);
                      setShowBrushSizes(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setBrushSize(size);
                        setShowBrushSizes(false);
                      }
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        borderRadius: "50%",
                        background: brushSize === size ? "#555" : "#999",
                        width: size + 3,
                        height: size + 3,
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              ref={eraserBtnRef}
              variant={currentTool === "eraser" ? "game" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentTool("eraser");
                if (isDrawing) setShowEraserSizes((prev) => !prev);
              }}
              disabled={!isDrawing}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            {showEraserSizes && isDrawing && currentTool === "eraser" && (
              <div
                ref={eraserMenuRef}
                className="absolute bottom-full left-1/2 -translate-x-1/2 ml-2 flex flex-col gap-1 bg-background/90  p-2 rounded shadow-lg z-10 border border-border"
              >
                {[2, 5, 10, 15, 20, 25, 30].map((size) => (
                  <span
                    key={size}
                    role="button"
                    tabIndex={0}
                    aria-label={`Eraser size ${size}`}
                    className={`flex items-center justify-center cursor-pointer transition-all "border-border hover:border-primary/50"`}
                    style={{
                      height: 28,
                      width: 28,
                      outline: "none",
                    }}
                    onClick={() => {
                      setEraserSize(size);
                      setShowEraserSizes(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setEraserSize(size);
                        setShowEraserSizes(false);
                      }
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        borderRadius: "50%",
                        background: eraserSize === size ? "#555" : "#999",
                        width: size,
                        height: size,
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            variant={currentTool === "fill" ? "game" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("fill")}
            disabled={!isDrawing}
          >
            <PaintBucket className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Button
            ref={paletteBtnRef}
            variant="outline"
            size="sm"
            onClick={() => {
              setShowPallete((prev) => !prev);
            }}
            disabled={!isDrawing}
          >
            <Palette className="w-4 h-4" />
          </Button>
          {showPallete && (
            <div
              ref={paletteMenuRef}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 grid grid-cols-3 gap-2 p-3 bg-background/90 rounded-lg shadow-lg z-20 border border-border min-w-[112px] w-[125px] justify-items-center"
            >
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 mx-1 rounded-full transition-all ${
                    currentColor === color
                      ? "border-primary scale-110 shadow-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setCurrentColor(color);
                    setShowPallete(false);
                  }}
                  disabled={!isDrawing}
                />
              ))}
            </div>
          )}
        </div>
        <Separator orientation="vertical" className="h-6" />
        {/* Clear Canvas */}
        <Button
          variant="destructive"
          size="sm"
          onClick={clearCanvas}
          disabled={!isDrawing}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
