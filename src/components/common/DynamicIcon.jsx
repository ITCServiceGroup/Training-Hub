import React, { useEffect, useState } from 'react';

const FallbackIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

/**
 * Loads the large authoring icon catalog only when a catalog icon is rendered.
 * The inline fallback prevents content layout shifts while the optional chunk loads.
 */
const DynamicIcon = ({ iconName, ...props }) => {
  const [IconComponent, setIconComponent] = useState(null);

  useEffect(() => {
    let active = true;

    import('../../utils/iconMappings')
      .then(({ getIconByName }) => {
        if (active) setIconComponent(() => getIconByName(iconName).component);
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('Icon catalog could not be loaded:', error);
      });

    return () => {
      active = false;
    };
  }, [iconName]);

  return IconComponent ? <IconComponent {...props} /> : <FallbackIcon {...props} />;
};

export default DynamicIcon;
