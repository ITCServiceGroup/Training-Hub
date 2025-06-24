import React, { useState, useEffect, useRef } from 'react';
import { FaEyeDropper } from 'react-icons/fa';

// Create a custom event for color picker coordination
const PICKER_OPEN_EVENT = 'color-picker-opened';

// Create a unique ID generator for color pickers
let nextPickerId = 0;

// Convert RGB to HSL
const rgbToHsl = (color) => {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l, a: color.a !== undefined ? color.a : 1 };
};

// Convert HSL to RGB
const hslToRgb = (color) => {
  let r, g, b;
  const h = color.h;
  const s = color.s;
  const l = color.l;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: color.a !== undefined ? color.a : 1
  };
};

/**
 * Custom color picker component that mimics the HTML5 color picker with
 * a color area, eyedropper tool, and RGB inputs.
 *
 * @param {Object} props
 * @param {Object} props.color - RGB color object with r, g, b, a properties
 * @param {Function} props.onChange - Callback function when color changes
 * @param {string} props.componentType - Type of component for theme conversion (container, text, button, etc.)
 */
const ColorPicker = ({
  color = { r: 0, g: 0, b: 0, a: 1 },
  onChange,
  hideOpacity = false,
}) => {
  // We don't need theme for this component
  const [isOpen, setIsOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [colorFormat, setColorFormat] = useState('hex'); // 'hex', 'rgb', or 'hsl'
  const colorPickerRef = useRef(null);
  const triggerRef = useRef(null);
  const pickerRef = useRef(null);

  // Create a unique ID for this color picker instance
  const pickerIdRef = useRef(nextPickerId++);
  const pickerId = pickerIdRef.current;

  // Convert RGB to HEX
  const rgbToHex = (rgb) => {
    return `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${
      Math.round(rgb.g).toString(16).padStart(2, '0')}${
      Math.round(rgb.b).toString(16).padStart(2, '0')}`.toLowerCase();
  };

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    // Handle 3-character hex codes by duplicating each character
    if (/^#?([a-f\d])([a-f\d])([a-f\d])$/i.test(hex)) {
      hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (_, r, g, b) => '#' + r + r + g + g + b + b
      );
    }

    // Now process as a 6-character hex code
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: color.a
        }
      : null;
  };

  // State for the color area picker
  const [isDragging, setIsDragging] = useState(false);
  const [hue, setHue] = useState(() => {
    const hsl = rgbToHsl(color);
    return hsl.h * 360;
  });
  const colorAreaRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Calculate saturation and value from RGB color using HSV model
  const calculateSaturationValue = (color) => {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Value is the maximum component
    const v = max;

    // Saturation is 0 if value is 0, otherwise (max-min)/max
    const s = max === 0 ? 0 : (max - min) / max;

    return { s, v };
  };

  // Track whether the color change is coming from dragging the color area
  const isColorAreaDraggingRef = useRef(false);

  // Set this flag when dragging starts/ends
  useEffect(() => {
    isColorAreaDraggingRef.current = isDragging;
  }, [isDragging]);

  // Update hue when color changes externally, but not when dragging the color area
  useEffect(() => {
    // Skip hue update if the color change is from dragging the color area
    if (isColorAreaDraggingRef.current) return;

    const hsl = rgbToHsl(color);
    setHue(hsl.h * 360);
  }, [color.r, color.g, color.b]);

  // State for tracking the selector position directly
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });

  // State for tracking the current HEX input value
  const [hexInputValue, setHexInputValue] = useState(() => rgbToHex(color));

  // Ref for debounce timeout
  const hexInputTimeoutRef = useRef(null);

  // Initialize selector position based on color only when component mounts or when color changes externally
  useEffect(() => {
    // Skip updating the selector position if we're dragging the color area
    if (isColorAreaDraggingRef.current) return;

    const { s, v } = calculateSaturationValue(color);
    setSelectorPosition({
      x: s * 100,
      y: (1 - v) * 100
    });
  }, [color.r, color.g, color.b]);

  // Separate effect for updating hex input value
  useEffect(() => {
    // Always update the hex input value when color changes, unless the user is actively typing in it
    const hexInput = document.querySelector('input[placeholder="#RRGGBB"]');
    const isUserTyping = hexInput && document.activeElement === hexInput;

    if (!isUserTyping) {
      setHexInputValue(rgbToHex(color));
    }
  }, [color.r, color.g, color.b]);

  // Global mouse tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging && colorAreaRef.current) {
        const rect = colorAreaRef.current.getBoundingClientRect();

        // Calculate x and y coordinates, clamped between 0 and 1
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // Update selector position directly
        setSelectorPosition({
          x: x * 100,
          y: y * 100
        });

        // Convert position to HSV, then to RGB
        // x coordinate maps to saturation (0 to 1)
        // y coordinate maps to value (1 to 0) - inverted because 0,0 is top-left
        const s = x;
        const v = 1 - y;

        // Use the current hue value - don't recalculate it
        // This ensures dragging in the color area doesn't affect the hue
        const h = hue / 360;

        // HSV to RGB conversion
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        let r, g, b;

        switch (i % 6) {
          case 0: r = v; g = t; b = p; break;
          case 1: r = q; g = v; b = p; break;
          case 2: r = p; g = v; b = t; break;
          case 3: r = p; g = q; b = v; break;
          case 4: r = t; g = p; b = v; break;
          case 5: r = v; g = p; b = q; break;
        }

        // Set the flag to indicate we're changing color from the color area
        // This will prevent the hue from being recalculated in the color change effect
        isColorAreaDraggingRef.current = true;

        // Update the color without changing the hue
        onChange({
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(b * 255),
          a: color.a
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      // Reset the flag when dragging ends
      isColorAreaDraggingRef.current = false;
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, hue, onChange, color.a]);

  // Handle color area mouse events
  const handleColorAreaMouseDown = () => {
    setIsDragging(true);
    isColorAreaDraggingRef.current = true;
  };

  // These are kept for compatibility but the actual work is done in the global handlers
  const handleColorAreaMouseMove = () => {};
  const handleColorAreaMouseUp = () => {
    isColorAreaDraggingRef.current = false;
  };

  // The handleColorAreaChange function has been moved into the useEffect for global mouse tracking

  // Handle hue slider change
  const handleHueChange = (e) => {
    const newHue = parseInt(e.target.value, 10);
    setHue(newHue);

    // Instead of recalculating the selector position from the color,
    // we'll use the current selector position to determine s and v values
    // This ensures the selector stays in place when only the hue changes
    const s = selectorPosition.x / 100;
    const v = 1 - (selectorPosition.y / 100);

    // Convert HSV to RGB with new hue
    const h = newHue / 360;

    // HSV to RGB conversion
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    // We're changing the color from the hue slider, so we don't want to update the hue again
    // when the color change effect runs
    const wasColorAreaDragging = isColorAreaDraggingRef.current;
    isColorAreaDraggingRef.current = false;

    onChange({
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: color.a
    });

    // Restore the previous state of the flag
    isColorAreaDraggingRef.current = wasColorAreaDragging;
  };

  // Handle RGB input changes
  const handleRgbChange = (channel, value) => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 255) {
      const newColor = { ...color, [channel]: newValue };

      // We're changing the color from the RGB inputs, so we don't want to update the selector position
      // in the useEffect that watches for color changes
      isColorAreaDraggingRef.current = true;

      onChange(newColor);

      // Update selector position to match the new color
      // This is necessary for RGB changes as they can affect both hue and saturation/value
      const { s, v } = calculateSaturationValue(newColor);
      setSelectorPosition({
        x: s * 100,
        y: (1 - v) * 100
      });

      // Also update the hue slider position
      const hsl = rgbToHsl(newColor);
      setHue(hsl.h * 360);

      // Reset the flag
      isColorAreaDraggingRef.current = false;
    }
  };

  // Process the hex input and update the color
  const processHexInput = (value) => {
    // Remove # if present for validation
    let hex = value.startsWith('#') ? value.substring(1) : value;

    // Check if it's a valid hex color (either 3 or 6 characters)
    const isValid3Hex = /^[0-9A-Fa-f]{3}$/.test(hex);
    const isValid6Hex = /^[0-9A-Fa-f]{6}$/.test(hex);

    if (isValid3Hex || isValid6Hex) {
      // If it's a 3-character hex, convert to 6-character format
      if (isValid3Hex) {
        hex = hex.split('').map(char => char + char).join('');
      }

      const rgb = hexToRgb(`#${hex}`);
      if (rgb) {
        // Keep the current alpha value
        rgb.a = color.a;

        // We're changing the color from the HEX input, so we don't want to update the selector position
        // in the useEffect that watches for color changes
        isColorAreaDraggingRef.current = true;

        onChange(rgb);

        // Update selector position to match the new color
        // This is necessary for HEX changes as they can affect both hue and saturation/value
        const { s, v } = calculateSaturationValue(rgb);
        setSelectorPosition({
          x: s * 100,
          y: (1 - v) * 100
        });

        // Update hue
        const hsl = rgbToHsl(rgb);
        setHue(hsl.h * 360);

        // Reset the flag
        isColorAreaDraggingRef.current = false;

        return true;
      }
    }

    return false;
  };



  // Handle HSL input changes
  const handleHslChange = (type, value) => {
    const hsl = rgbToHsl(color);
    let h = hsl.h * 360;
    let s = hsl.s * 100;
    let l = hsl.l * 100;

    // Update the appropriate HSL component
    if (type === 'h') {
      h = parseInt(value, 10);
      if (isNaN(h) || h < 0 || h > 360) return;
    } else if (type === 's') {
      s = parseInt(value, 10);
      if (isNaN(s) || s < 0 || s > 100) return;
    } else if (type === 'l') {
      l = parseInt(value, 10);
      if (isNaN(l) || l < 0 || l > 100) return;
    }

    // Convert back to RGB
    const newHsl = { h: h / 360, s: s / 100, l: l / 100, a: color.a };
    const newRgb = hslToRgb(newHsl);

    // We're changing the color from the HSL inputs
    isColorAreaDraggingRef.current = true;

    // Update the color
    onChange(newRgb);

    if (type === 'h') {
      // If only hue is changing, keep the selector position the same
      // and just update the hue value
      setHue(h);
    } else {
      // For saturation and lightness changes, update the selector position
      const { s: saturation, v } = calculateSaturationValue(newRgb);
      setSelectorPosition({
        x: saturation * 100,
        y: (1 - v) * 100
      });
    }

    // Reset the flag
    isColorAreaDraggingRef.current = false;
  };

  // Handle eyedropper tool
  const handleEyeDropper = async () => {
    // Check if the EyeDropper API is available
    if (!window.EyeDropper) {
      alert('The EyeDropper API is not supported in this browser.');
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      // Convert hex to rgb
      const hex = result.sRGBHex;
      const rgb = hexToRgb(hex);

      if (rgb) {
        // We're changing the color from the eyedropper
        isColorAreaDraggingRef.current = true;

        onChange(rgb);

        // Update selector position to match the new color
        const { s, v } = calculateSaturationValue(rgb);
        setSelectorPosition({
          x: s * 100,
          y: (1 - v) * 100
        });

        // Update hue
        const hsl = rgbToHsl(rgb);
        setHue(hsl.h * 360);

        // Reset the flag
        isColorAreaDraggingRef.current = false;
      }
      setIsOpen(false);
    } catch (error) {
      console.log('EyeDropper was canceled or failed:', error);
    }
  };

  // Position the color picker dropdown
  useEffect(() => {
    if (isOpen && triggerRef.current && colorPickerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const pickerWidth = 240; // Width of the color picker
      const pickerHeight = 280; // Approximate height of the color picker

      // Calculate available space in different directions
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const spaceRight = window.innerWidth - triggerRect.left;

      // Calculate position for fixed positioning (relative to viewport)
      let top = triggerRect.bottom + 5; // Default: below the trigger
      let left = triggerRect.left; // Align with left edge of trigger

      // Check vertical positioning
      if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
        // Position above if there's not enough space below but enough above
        top = triggerRect.top - pickerHeight - 5;
      }

      // Check horizontal positioning
      if (spaceRight < pickerWidth) {
        // If not enough space to the right, align with right edge of trigger
        left = triggerRect.right - pickerWidth;
      }

      // Final adjustment to ensure the picker stays within the viewport
      if (left < 10) left = 10; // Minimum 10px from left edge
      if (left + pickerWidth > window.innerWidth - 10) {
        left = window.innerWidth - pickerWidth - 10; // Minimum 10px from right edge
      }

      // Set the position
      setPickerPosition({ top, left });
    }
  }, [isOpen]);

  // Listen for other color pickers being opened
  useEffect(() => {
    const handlePickerOpen = (event) => {
      // If another picker was opened (not this one), close this one
      if (event.detail.id !== pickerId && isOpen) {
        setIsOpen(false);
      }
    };

    // Add event listener for color picker coordination
    document.addEventListener(PICKER_OPEN_EVENT, handlePickerOpen);

    return () => {
      document.removeEventListener(PICKER_OPEN_EVENT, handlePickerOpen);
    };
  }, [pickerId, isOpen]);

  // Dispatch event when this picker is opened
  useEffect(() => {
    if (isOpen) {
      // Notify other pickers that this one has opened
      document.dispatchEvent(
        new CustomEvent(PICKER_OPEN_EVENT, {
          detail: { id: pickerId }
        })
      );
    }
  }, [isOpen, pickerId]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (hexInputTimeoutRef.current) {
        clearTimeout(hexInputTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close the picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        {/* Color swatch button to open the picker */}
        <button
          ref={triggerRef}
          type="button"
          className="w-8 h-8 rounded border border-gray-300 dark:border-slate-600 overflow-hidden"
          style={{
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
            backgroundImage: color.a < 1 ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==")' : 'none',
            backgroundPosition: 'left center'
          }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open color picker"
        />

        {/* Opacity slider with input field - hidden when hideOpacity is true */}
        {!hideOpacity && (
          <div className="flex-1 flex items-center gap-2" style={{ height: '32px' }}>
            <div className="w-2/3 flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={color.a}
                onChange={(e) => {
                  const newAlpha = parseFloat(e.target.value);
                  onChange({ ...color, a: newAlpha });
                }}
                className="w-full h-3 rounded appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                style={{
                  background: `linear-gradient(to right,
                    rgba(${color.r}, ${color.g}, ${color.b}, 0),
                    rgba(${color.r}, ${color.g}, ${color.b}, 1))`,
                  WebkitAppearance: 'none',
                  margin: 0
                }}
                aria-label="Adjust opacity"
              />
            </div>
            <div className="w-1/3 flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(color.a * 100)}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    const newAlpha = value / 100;
                    onChange({ ...color, a: newAlpha });
                  }
                }}
                className="w-full px-1 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                style={{ margin: 0 }}
                aria-label="Opacity percentage"
              />
            </div>
          </div>
        )}
      </div>

      {/* Color picker dropdown */}
      {isOpen && (
        <div
          ref={colorPickerRef}
          className="fixed z-[9999] p-2 bg-white dark:bg-slate-800 rounded shadow-lg border border-gray-200 dark:border-slate-700"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            width: '240px'
          }}
        >
          {/* Color picker area */}
          <div className="mb-2">
            {/* Color area */}
            <div
              ref={colorAreaRef}
              className="w-full h-24 relative rounded cursor-crosshair mb-1"
              style={{
                position: 'relative',
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
                overflow: 'hidden'
              }}
              onMouseDown={handleColorAreaMouseDown}
              onMouseMove={handleColorAreaMouseMove}
              onMouseUp={handleColorAreaMouseUp}
              onMouseLeave={handleColorAreaMouseUp}
            >
              {/* White to transparent gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, #fff, rgba(255, 255, 255, 0))'
                }}
              />

              {/* Transparent to black gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), #000)'
                }}
              />

              {/* Color selector dot */}
              <div
                className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm pointer-events-none"
                style={{
                  left: `${selectorPosition.x}%`,
                  top: `${selectorPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Hue slider */}
            <div className="mb-1">
              <input
                ref={hueSliderRef}
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="w-full h-3 rounded appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
                style={{
                  background: `linear-gradient(to right,
                    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
                  WebkitAppearance: 'none'
                }}
              />
            </div>
          </div>

          {/* Eyedropper button */}
          <div className="mb-2">
            <button
              onClick={handleEyeDropper}
              className="flex items-center justify-center w-full h-7 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs text-gray-600 dark:text-gray-300"
              title="Pick color from screen"
            >
              <FaEyeDropper className="mr-1" />
              Pick color from screen
            </button>
          </div>

          {/* Color format toggle */}
          <div className="mb-2 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm space-x-1" role="group">
              <button
                type="button"
                className={`px-2 py-1 text-xs rounded-md ${
                  colorFormat === 'hex'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => setColorFormat('hex')}
              >
                HEX
              </button>
              <button
                type="button"
                className={`px-2 py-1 text-xs rounded-md ${
                  colorFormat === 'rgb'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => setColorFormat('rgb')}
              >
                RGB
              </button>
              <button
                type="button"
                className={`px-2 py-1 text-xs rounded-md ${
                  colorFormat === 'hsl'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white'
                }`}
                onClick={() => setColorFormat('hsl')}
              >
                HSL
              </button>
            </div>
          </div>

          {/* HEX input */}
          {colorFormat === 'hex' && (
            <div className="mb-2">
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>HEX</span>
                <input
                  type="text"
                  value={hexInputValue}
                  onChange={(e) => {
                    // Only allow valid hex characters and #
                    const value = e.target.value.replace(/[^#0-9A-Fa-f]/g, '');

                    // Limit to 7 characters (# + 6 hex digits)
                    const trimmedValue = value.slice(0, 7);

                    // ONLY update the input value, don't process the color yet
                    // This allows the user to type freely without premature conversion
                    setHexInputValue(trimmedValue);

                    // Clear any existing timeout
                    if (hexInputTimeoutRef.current) {
                      clearTimeout(hexInputTimeoutRef.current);
                    }

                    // Set a new timeout to process the color after a delay
                    // This allows the user to finish typing before the color is processed
                    hexInputTimeoutRef.current = setTimeout(() => {
                      // Only process if the input is still focused
                      // This prevents processing when the user is still typing
                      if (document.activeElement === e.target) {
                        // Check if it's a valid hex color
                        const hex = trimmedValue;
                        const isValid3Hex = /^#?[0-9A-Fa-f]{3}$/.test(hex);
                        const isValid6Hex = /^#?[0-9A-Fa-f]{6}$/.test(hex);

                        if (isValid3Hex || isValid6Hex) {
                          processHexInput(hex);
                        }
                      }
                    }, 1000); // 1 second delay
                  }}
                  onBlur={() => {
                    // When the input loses focus, ensure it's a valid format
                    let hex = hexInputValue.trim();

                    // If empty, revert to current color
                    if (!hex) {
                      setHexInputValue(rgbToHex(color));
                      return;
                    }

                    // Add # if missing
                    if (!hex.startsWith('#')) {
                      hex = '#' + hex;
                    }

                    // Check if it's a valid hex color
                    let validHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

                    // If it's not valid, try to fix common issues
                    if (!validHex) {
                      // If it's a partial hex (1-2 chars), pad with zeros
                      if (/^#[0-9A-Fa-f]{1,2}$/.test(hex)) {
                        hex = hex.padEnd(3, '0');
                      }

                      // If it's 4-5 chars, try to make it 6
                      if (/^#[0-9A-Fa-f]{4,5}$/.test(hex)) {
                        hex = hex.padEnd(7, '0');
                      }

                      // Check if it's valid now
                      validHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
                    }

                    // If it's still not valid, revert to current color
                    if (!validHex) {
                      setHexInputValue(rgbToHex(color));
                    } else {
                      // Update with the formatted value
                      setHexInputValue(hex.toLowerCase());
                      // Also update the color
                      processHexInput(hex);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    // Apply color when Enter is pressed
                    if (e.key === 'Enter') {
                      // Process the current input value
                      const success = processHexInput(hexInputValue);
                      if (!success) {
                        // If processing failed, revert to current color
                        setHexInputValue(rgbToHex(color));
                      }
                      e.target.blur();
                    }
                  }}
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                  maxLength="7"
                  placeholder="#RRGGBB"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* RGB inputs */}
          {colorFormat === 'rgb' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>R</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={Math.round(color.r)}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>G</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={Math.round(color.g)}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>B</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={Math.round(color.b)}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HSL inputs */}
          {colorFormat === 'hsl' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>H</span>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={Math.round(rgbToHsl(color).h * 360)}
                    onChange={(e) => handleHslChange('h', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>S</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(rgbToHsl(color).s * 100)}
                    onChange={(e) => handleHslChange('s', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1" style={{ display: 'flex', alignItems: 'center', height: '24px', transform: 'translateY(-7px)' }}>L</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(rgbToHsl(color).l * 100)}
                    onChange={(e) => handleHslChange('l', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white text-center h-6"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
