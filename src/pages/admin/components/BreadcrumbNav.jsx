import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const BreadcrumbNav = ({ items }) => {
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0',
    color: '#6B7280',
    fontSize: '0.875rem'
  };

  const linkStyles = {
    color: '#3B82F6',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s'
  };

  const labelStyles = {
    color: '#4B5563',
    fontWeight: '500'
  };

  const chevronStyles = {
    fontSize: '0.75rem',
    color: '#9CA3AF'
  };

  const currentStyles = {
    color: '#1F2937',
    fontWeight: '500'
  };

  return (
    <nav style={containerStyles} aria-label="Breadcrumb">
      <span style={labelStyles}>
        Study Guides
      </span>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FaChevronRight style={chevronStyles} />
          {index === items.length - 1 ? (
            <span style={currentStyles}>{item.label}</span>
          ) : (
            <span
              style={linkStyles}
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
