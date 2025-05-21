import { 
  FaNetworkWired, 
  FaDownload, 
  FaWrench, 
  FaSearch, 
  FaLock, 
  FaLaptop, 
  FaChartBar, 
  FaRocket, 
  FaBook,
  FaServer,
  FaDatabase,
  FaCloud,
  FaDesktop,
  FaCode,
  FaShieldAlt,
  FaTools,
  FaCogs,
  FaUserCog,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaClipboardList,
  FaClipboardCheck,
  FaFileAlt,
  FaFileCode,
  FaFilePdf,
  FaFileVideo,
  FaVideo,
  FaPlay,
  FaQuestion,
  FaQuestionCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle
} from 'react-icons/fa';

// Map icon names to components
export const iconComponentMap = {
  'Network': FaNetworkWired,
  'Download': FaDownload,
  'Wrench': FaWrench,
  'Search': FaSearch,
  'Lock': FaLock,
  'Laptop': FaLaptop,
  'Chart': FaChartBar,
  'Rocket': FaRocket,
  'Book': FaBook,
  'Server': FaServer,
  'Database': FaDatabase,
  'Cloud': FaCloud,
  'Desktop': FaDesktop,
  'Code': FaCode,
  'Shield': FaShieldAlt,
  'Tools': FaTools,
  'Cogs': FaCogs,
  'User Cog': FaUserCog,
  'User Shield': FaUserShield,
  'User Tie': FaUserTie,
  'Graduate': FaUserGraduate,
  'Graduation Cap': FaGraduationCap,
  'Teacher': FaChalkboardTeacher,
  'Clipboard List': FaClipboardList,
  'Clipboard Check': FaClipboardCheck,
  'File': FaFileAlt,
  'File Code': FaFileCode,
  'PDF': FaFilePdf,
  'Video File': FaFileVideo,
  'Video': FaVideo,
  'Play': FaPlay,
  'Question': FaQuestion,
  'Question Circle': FaQuestionCircle,
  'Info': FaInfoCircle,
  'Warning Triangle': FaExclamationTriangle,
  'Warning Circle': FaExclamationCircle
};

// Map icon names to colors
export const iconColorMap = {
  'Network': '#0369a1',
  'Download': '#0891b2',
  'Wrench': '#0e7490',
  'Search': '#0c4a6e',
  'Lock': '#7e22ce',
  'Laptop': '#15803d',
  'Chart': '#b45309',
  'Rocket': '#0e7490',
  'Book': '#0f766e',
  'Server': '#4f46e5',
  'Database': '#7c3aed',
  'Cloud': '#0ea5e9',
  'Desktop': '#10b981',
  'Code': '#f59e0b',
  'Shield': '#ef4444',
  'Tools': '#6366f1',
  'Cogs': '#8b5cf6',
  'User Cog': '#ec4899',
  'User Shield': '#f43f5e',
  'User Tie': '#0d9488',
  'Graduate': '#0369a1',
  'Graduation Cap': '#0891b2',
  'Teacher': '#0e7490',
  'Clipboard List': '#0c4a6e',
  'Clipboard Check': '#7e22ce',
  'File': '#15803d',
  'File Code': '#b45309',
  'PDF': '#0e7490',
  'Video File': '#0f766e',
  'Video': '#4f46e5',
  'Play': '#7c3aed',
  'Question': '#0ea5e9',
  'Question Circle': '#10b981',
  'Info': '#f59e0b',
  'Warning Triangle': '#ef4444',
  'Warning Circle': '#6366f1'
};

// List of all available icons for the selector
export const availableIcons = Object.keys(iconComponentMap).map(name => ({
  name,
  component: iconComponentMap[name],
  color: iconColorMap[name]
}));

// Get icon component and color by name
export const getIconByName = (iconName) => {
  const IconComponent = iconComponentMap[iconName] || FaBook;
  const iconColor = iconColorMap[iconName] || '#0f766e';
  
  return { 
    component: IconComponent,
    color: iconColor 
  };
};
