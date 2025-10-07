import { useState, useEffect, useRef } from 'react';
import { hslToHex } from '@/utils/colorUtils';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface InteractiveColorWheelProps {
  onColorSelect?: (color: string) => void;
  selectedHue?: number;
}

const InteractiveColorWheel = ({ onColorSelect, selectedHue: externalHue }: InteractiveColorWheelProps) => {
  const [hue, setHue] = useState(externalHue ?? 0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalHue !== undefined) {
      setHue(externalHue);
    }
  }, [externalHue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 90) * Math.PI / 180;
      const endAngle = (angle + 1 - 90) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const hslColor = `hsl(${angle}, 100%, 50%)`;
      ctx.fillStyle = hslColor;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();

    const markerAngle = (hue - 90) * Math.PI / 180;
    const markerX = centerX + Math.cos(markerAngle) * radius * 0.7;
    const markerY = centerY + Math.sin(markerAngle) * radius * 0.7;

    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = hslToHex(hue, 100, 50);
    ctx.fill();
  }, [hue]);

  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = canvas.width / 2 - 10;

    if (distance > maxRadius * 0.3 && distance < maxRadius) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;

      setHue(Math.round(angle));
      if (onColorSelect) {
        onColorSelect(hslToHex(Math.round(angle), saturation, lightness));
      }
    }
  };

  const currentColor = hslToHex(hue, saturation, lightness);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold">Interactive Color Wheel</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Click on the wheel to select a hue
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            onClick={handleWheelClick}
            className="cursor-pointer"
          />

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg shadow-lg border-2 border-border"
              style={{ backgroundColor: currentColor }}
            />
            <div>
              <div className="text-sm font-medium">{currentColor}</div>
              <div className="text-xs text-muted-foreground">
                H: {hue}° S: {saturation}% L: {lightness}%
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm flex justify-between">
              <span>Saturation</span>
              <span className="text-muted-foreground">{saturation}%</span>
            </Label>
            <input
              type="range"
              min="0"
              max="100"
              value={saturation}
              onChange={(e) => {
                setSaturation(parseInt(e.target.value));
                if (onColorSelect) {
                  onColorSelect(hslToHex(hue, parseInt(e.target.value), lightness));
                }
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`
              }}
            />
          </div>

          <div>
            <Label className="text-sm flex justify-between">
              <span>Lightness</span>
              <span className="text-muted-foreground">{lightness}%</span>
            </Label>
            <input
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={(e) => {
                setLightness(parseInt(e.target.value));
                if (onColorSelect) {
                  onColorSelect(hslToHex(hue, saturation, parseInt(e.target.value)));
                }
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InteractiveColorWheel;
