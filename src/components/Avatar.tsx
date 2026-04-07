'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AvatarDirection, AvatarAction, AvatarGesture } from '@/lib/avatar-types';
import { getSpritePath, getAvatarUrl } from '@/lib/avatar-types';

interface AvatarProps {
  /** Preset ID (e.g. 'developer') or custom figure code */
  preset?: string;
  /** Custom Habbo figure code — used when preset is not provided */
  figureCode?: string;
  /** Direction 0-7 */
  direction?: AvatarDirection;
  /** Current action */
  action?: AvatarAction;
  /** Gesture (only applies to std action) */
  gesture?: AvatarGesture;
  /** Walk animation frame */
  frame?: number;
  /** Size in pixels (default 64) */
  size?: number;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Display name below avatar */
  label?: string;
  /** Whether to animate walking automatically */
  animate?: boolean;
}

export default function Avatar({
  preset,
  figureCode,
  direction = 2,
  action = 'std',
  gesture = 'std',
  frame = 0,
  size = 64,
  className = '',
  onClick,
  label,
  animate = false,
}: AvatarProps) {
  const [currentFrame, setCurrentFrame] = useState(frame);
  const [imgSrc, setImgSrc] = useState('');
  const [useFallback, setUseFallback] = useState(false);

  // Resolve image source: local sprite file or Habbo API fallback
  useEffect(() => {
    if (preset && !useFallback) {
      setImgSrc(getSpritePath(preset, action, direction, currentFrame));
    } else if (figureCode) {
      setImgSrc(getAvatarUrl(figureCode, direction, action, gesture, currentFrame));
    } else if (preset) {
      // Fallback: we don't know the figure code for this preset
      setImgSrc(getSpritePath(preset, action, direction, currentFrame));
    }
  }, [preset, figureCode, direction, action, gesture, currentFrame, useFallback]);

  // Walk animation loop
  useEffect(() => {
    if (!animate || action !== 'wlk') return;
    const interval = setInterval(() => {
      setCurrentFrame(f => (f + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, [animate, action]);

  const handleError = useCallback(() => {
    if (!useFallback && figureCode) {
      setUseFallback(true);
    }
  }, [useFallback, figureCode]);

  return (
    <div
      className={`inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ width: size }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={label || preset || 'Avatar'}
          width={size}
          height={size * 1.7}
          style={{
            imageRendering: 'pixelated',
            width: size,
            height: 'auto',
          }}
          onError={handleError}
          draggable={false}
        />
      )}
      {label && (
        <span
          className="mt-1 text-xs text-white text-center truncate w-full"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
