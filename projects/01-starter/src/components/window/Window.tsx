"use client";

import type { CSSProperties, ReactNode } from "react";

type WindowProps = {
  title: string;
  children: ReactNode;
  width?: number | string;
  style?: CSSProperties;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  showControls?: boolean;
};

export function Window({
  title,
  children,
  width,
  style,
  className,
  onClose,
  onMinimize,
  onMaximize,
  showControls = true,
}: WindowProps) {
  return (
    <div
      className={`window ${className ?? ""}`}
      style={{ width, ...style }}
    >
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        {showControls && (
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={onMinimize} />
            <button aria-label="Maximize" onClick={onMaximize} />
            <button aria-label="Close" onClick={onClose} />
          </div>
        )}
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
