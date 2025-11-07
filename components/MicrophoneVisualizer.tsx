import React, { useRef, useEffect } from 'react';

interface MicrophoneVisualizerProps {
  analyserNode: AnalyserNode | null;
}

const VISUALIZER_BAR_COLOR = '#00A884'; // WhatsApp green
const VISUALIZER_ACCENT_COLOR = '#005C4B'; // Darker green
const VISUALIZER_BG_COLOR = 'transparent';

export const MicrophoneVisualizer: React.FC<MicrophoneVisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    if (!canvasCtx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Enhanced drawing with gradient
    const draw = (_time: number) => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = VISUALIZER_BG_COLOR;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Create gradient for visual appeal
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, VISUALIZER_BAR_COLOR);
      gradient.addColorStop(1, VISUALIZER_ACCENT_COLOR);

      canvasCtx.lineWidth = 2.5;
      canvasCtx.strokeStyle = gradient;
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = centerY + (v * centerY * 0.8); // Slightly reduced amplitude for smoother look

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.stroke();
    };

    draw(0);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode]);
  
  if (!analyserNode) {
    return (
      <div className="flex items-center gap-1.5 h-8">
        <div className="w-1 h-4 bg-[#8696A0] rounded-full"></div>
        <div className="w-1 h-6 bg-[#8696A0] rounded-full"></div>
        <div className="w-1 h-3 bg-[#8696A0] rounded-full"></div>
        <div className="w-1 h-5 bg-[#8696A0] rounded-full"></div>
        <div className="w-1 h-4 bg-[#8696A0] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width="100" 
        height="32" 
        className="rounded-lg bg-gradient-to-r from-[#005C4B]/10 to-[#00A884]/10 border border-[#005C4B]/20 shadow-md" 
      />
    </div>
  );
};