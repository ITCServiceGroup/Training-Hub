import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaChevronRight } from 'react-icons/fa';

const BreadcrumbNav = ({ items }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <nav className="flex items-center gap-2 py-4 text-gray-500 dark:text-gray-300 text-sm" aria-label="Breadcrumb">
      <span className="text-gray-600 dark:text-gray-200 font-medium">
        Study Guides
      </span>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FaChevronRight className="text-xs text-gray-400 dark:text-gray-500" />
          {index === items.length - 1 ? (
            <span className="text-gray-800 dark:text-white font-medium">{item.label}</span>
          ) : (
            <span
              className="text-teal-600 dark:text-teal-500 no-underline cursor-pointer transition-colors hover:text-teal-700 dark:hover:text-teal-400"
              onClick={item.onClick}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
