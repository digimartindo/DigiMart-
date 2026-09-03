import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ConsoleTimerProps {
  startTime: number;
  targetDurationMinutes?: number;
}

export default function ConsoleTimer({ startTime, targetDurationMinutes }: ConsoleTimerProps) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    setElapsed(Date.now() - startTime);
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const elapsedMinutes = Math.floor(elapsed / 60000);
  const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = elapsedMinutes % 60;

  // Prepaid mode
  if (targetDurationMinutes && targetDurationMinutes > 0) {
    const totalTargetMs = targetDurationMinutes * 60000;
    const timeLeftMs = Math.max(0, totalTargetMs - elapsed);
    const timeLeftSec = Math.floor(timeLeftMs / 1000);
    const hLeft = Math.floor(timeLeftSec / 3600);
    const mLeft = Math.floor((timeLeftSec % 3600) / 60);
    const sLeft = timeLeftSec % 60;

    const isOvertime = elapsed > totalTargetMs;
    const isAlmostUp = !isOvertime && timeLeftMs < 10 * 60000; // < 10 mins

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <Clock size={12} /> Sisa Waktu Paket:
          </span>
          <span
            className={`font-mono font-bold text-sm ${
              isOvertime
                ? 'text-rose-600 animate-pulse'
                : isAlmostUp
                ? 'text-amber-600 font-extrabold'
                : 'text-emerald-700'
            }`}
          >
            {isOvertime ? '+ ' : ''}
            {hLeft > 0 ? `${hLeft}j ` : ''}
            {mLeft}m {sLeft}d
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isOvertime
                ? 'bg-rose-500'
                : isAlmostUp
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(100, Math.round((elapsed / totalTargetMs) * 100))}%`,
            }}
          />
        </div>

        {isAlmostUp && !isOvertime && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <AlertTriangle size={12} /> Sisa waktu kurang dari 10 menit!
          </div>
        )}
        {isOvertime && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertTriangle size={12} /> Paket habis! Kelebihan waktu dihitung.
          </div>
        )}
      </div>
    );
  }

  // Open billing mode
  return (
    <span className="font-mono font-semibold">
      {elapsedHours > 0 ? `${elapsedHours}j ` : ''}
      {remainingMinutes}m {elapsedSeconds}d
    </span>
  );
}
