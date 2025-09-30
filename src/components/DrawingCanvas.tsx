import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Pen, 
  Palette, 
  RotateCcw, 
  Eraser, 
  Minus, 
  Plus,
  Circle,
  Square
} from "lucide-react";

export interface DrawingCanvasProps {
  isDrawing: boolean;
  word?: string;
}

export const DrawingCanvas = ({ isDrawing, word }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'fill'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#90EE90', '#FFB6C1'
  ];

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set default drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
  }, [currentColor, brushSize]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsMouseDown(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'fill') {
      // Simple flood fill would go here
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMouseDown) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <Card className="p-4 bg-game-surface border-primary/20">
      {/* Drawing Word Display */}
      {isDrawing && word && (
        <div className="text-center mb-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Draw this word:</p>
          <p className="text-2xl font-bold text-primary">{word}</p>
        </div>
      )}

      {/* Tool Bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-background/10 rounded-lg">
        {/* Drawing Tools */}
        <div className="flex gap-2">
          <Button
            variant={currentTool === 'pen' ? 'game' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('pen')}
            disabled={!isDrawing}
          >
            <Pen className="w-4 h-4" />
          </Button>
          <Button
            variant={currentTool === 'eraser' ? 'game' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('eraser')}
            disabled={!isDrawing}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            variant={currentTool === 'fill' ? 'game' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('fill')}
            disabled={!isDrawing}
          >
            <Palette className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
            disabled={!isDrawing}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm min-w-[2rem] text-center">{brushSize}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
            disabled={!isDrawing}
          >
            <Plus className="w-3 h-3" />
          </Button>
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

      {/* Color Palette */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-background/10 rounded-lg">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color 
                ? 'border-primary scale-110 shadow-glow' 
                : 'border-border hover:border-primary/50'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
            disabled={!isDrawing}
          />
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className={`border-2 border-border rounded-lg bg-white ${
            isDrawing ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Canvas Info */}
      {!isDrawing && (
        <div className="text-center mt-4 p-3 bg-muted/10 rounded-lg">
          <p className="text-muted-foreground">
            {word ? 'Watch and guess the drawing!' : 'Waiting for the game to start...'}
          </p>
        </div>
      )}
    </Card>
  );
};