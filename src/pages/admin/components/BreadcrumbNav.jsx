import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const BreadcrumbNav = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 py-4 text-gray-500 text-sm" aria-label="Breadcrumb">
      <span className="text-gray-600 font-medium">
        Study Guides
      </span>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FaChevronRight className="text-xs text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-800 font-medium">{item.label}</span>
          ) : (
            <span
              className="text-blue-500 no-underline cursor-pointer transition-colors hover:text-blue-600"
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
