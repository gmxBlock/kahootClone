import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for auto-resizing textareas based on content
 * @param {string} value - The current value of the textarea
 * @param {number} minRows - Minimum number of rows (default: 3)
 * @param {number} maxRows - Maximum number of rows (default: 10)
 * @returns {Object} - Ref to attach to textarea and resize function
 */
export const useAutoResize = (value, minRows = 3, maxRows = 10) => {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate line height and minimum/maximum heights
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
    const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
    const borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
    const borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
    
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom + borderTop + borderBottom;
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom + borderTop + borderBottom;
    
    // Set the height based on content, but within min/max bounds
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    
    textarea.style.height = `${newHeight}px`;
    
    // Add or remove scrollbar based on whether we've hit the maximum
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [minRows, maxRows]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Initial resize
    resize();

    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [resize]);

  return { textareaRef, resize };
};
