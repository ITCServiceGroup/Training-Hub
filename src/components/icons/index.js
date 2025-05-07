import {
  // Actions
  FaSave,
  FaDownload,
  FaUpload,
  FaShare,
  FaExternalLinkAlt,
  FaStar,
  FaHeart,

  // Content Types
  FaFile,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaLink,
  FaExpand,
  FaCompress,
  FaYoutube,

  // Data & Charts
  FaList,
  FaTable,
  FaColumns,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaChartArea,
  FaDatabase,
  FaTachometerAlt,

  // Interface
  FaBars,
  FaSquare,
  FaCheck,
  FaCog,
  FaTrash,
  FaEdit,
  FaLayerGroup,
  FaFont,
  FaPlus,
  FaMinus,
  FaEye,
  FaEyeSlash,
  FaUndo,
  FaRedo,
  FaSearch,
  FaCopy,
  FaPaste,

  // Learning
  FaLightbulb,
  FaBook,
  FaQuestionCircle,
  FaGraduationCap,
  FaBrain,
  FaInfo,

  // Navigation
  FaArrowRight,
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaChevronLeft,
  FaChevronUp,
  FaChevronDown,
  FaArrowsAlt,
  FaArrowsAltH,

  // Notifications
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaBell,
  FaBellSlash,
  FaTimesCircle,
  FaCheckCircle,

  // Security
  FaShieldAlt,
  FaKey,
  FaFingerprint,
  FaUserLock,
  FaUserShield,
  FaIdBadge,
  FaLock,
  FaUnlock,

  // Time
  FaHourglassHalf,
  FaClock,
  FaStopwatch,
  FaHistory,
  FaCalendarAlt,
  FaCalendarCheck,

  // Tools
  FaWrench,
  FaTools,
  FaToolbox,
  FaHammer,
  FaScrewdriver,
  FaCogs,
  FaSlidersH,
  FaMagic,

  // Weather & Nature
  FaBolt,
  FaTint,
  FaCloud,
  FaThermometerHalf,
  FaSun
} from 'react-icons/fa';

// Map of icon names to display names (for UI), organized by category
export const ICON_CATEGORIES = {
  'Actions': {
    'save': 'Save',
    'download': 'Download',
    'upload': 'Upload',
    'share': 'Share',
    'external-link': 'External Link',
    'star': 'Star',
    'heart': 'Heart'
  },
  'Content': {
    'file': 'File',
    'file-alt': 'Document',
    'image': 'Image',
    'video': 'Video',
    'link': 'Link',
    'expand': 'Expand',
    'compress': 'Compress',
    'youtube': 'YouTube',
  },
  'Data & Charts': {
    'list': 'List',
    'table': 'Table',
    'columns': 'Columns',
    'chart-bar': 'Bar Chart',
    'chart-line': 'Line Chart',
    'chart-pie': 'Pie Chart',
    'chart-area': 'Area Chart',
    'database': 'Database',
    'dashboard': 'Dashboard',
  },
  'Interface': {
    'menu': 'Menu',
    'square': 'Square',
    'check': 'Check',
    'settings': 'Settings',
    'delete': 'Delete',
    'edit': 'Edit',
    'layers': 'Layers',
    'type': 'Type',
    'add': 'Add',
    'remove': 'Remove',
    'show': 'Show',
    'hide': 'Hide',
    'undo': 'Undo',
    'redo': 'Redo',
    'search': 'Search',
    'copy': 'Copy',
    'paste': 'Paste',
  },
  'Learning': {
    'lightbulb': 'Idea',
    'book': 'Book',
    'question': 'Question',
    'graduation-cap': 'Education',
    'brain': 'Knowledge',
    'info': 'Info',
  },
  'Navigation': {
    'double-arrow': 'Double Sided Arrow',
    'arrow-right': 'Arrow Right',
    'arrow-left': 'Arrow Left',
    'arrow-up': 'Arrow Up',
    'arrow-down': 'Arrow Down',
    'chevron-right': 'Chevron Right',
    'chevron-left': 'Chevron Left',
    'chevron-up': 'Chevron Up',
    'chevron-down': 'Chevron Down',
    'move': 'Move',
  },
  'Notifications': {
    'warning': 'Warning',
    'exclamation': 'Exclamation',
    'info-circle': 'Info Circle',
    'bell': 'Notification',
    'bell-off': 'Notification Off',
    'error': 'Error',
    'success': 'Success',
  },
  'Security': {
    'shield': 'Shield',
    'key': 'Key',
    'fingerprint': 'Fingerprint',
    'user-lock': 'User Lock',
    'user-shield': 'User Shield',
    'id-badge': 'ID Badge',
    'lock': 'Lock',
    'unlock': 'Unlock'
  },
  'Time': {
    'hourglass': 'Hourglass',
    'clock': 'Clock',
    'stopwatch': 'Stopwatch',
    'history': 'History',
    'calendar': 'Calendar',
    'calendar-check': 'Calendar Check'
  },
  'Tools': {
    'wrench': 'Wrench',
    'toolset': 'Tools Set',
    'toolbox': 'Toolbox',
    'hammer': 'Hammer',
    'screwdriver': 'Screwdriver',
    'gears': 'Gears',
    'sliders': 'Sliders',
    'magic-wand': 'Magic Wand'
  },
  'Weather & Nature': {
    'lightning': 'Lightning Bolt',
    'water-drop': 'Water Drop',
    'rain-cloud': 'Rain Cloud',
    'thermometer': 'Thermometer',
    'sun': 'Sun'
  }
};

// Flatten categories into a single map for backward compatibility
export const ICON_NAME_MAP = Object.entries(ICON_CATEGORIES).reduce((acc, [category, icons]) => {
  return { ...acc, ...icons };
}, {});

// Map icon keys to their components
export const ICONS = {
  // Actions
  'save': FaSave,
  'download': FaDownload,
  'upload': FaUpload,
  'share': FaShare,
  'external-link': FaExternalLinkAlt,
  'star': FaStar,
  'heart': FaHeart,

  // Content Types
  'file': FaFile,
  'file-alt': FaFileAlt,
  'image': FaImage,
  'video': FaVideo,
  'link': FaLink,
  'expand': FaExpand,
  'compress': FaCompress,
  'youtube': FaYoutube,

  // Data & Charts
  'list': FaList,
  'table': FaTable,
  'columns': FaColumns,
  'chart-bar': FaChartBar,
  'chart-line': FaChartLine,
  'chart-pie': FaChartPie,
  'chart-area': FaChartArea,
  'database': FaDatabase,
  'dashboard': FaTachometerAlt,

  // Interface
  'menu': FaBars,
  'square': FaSquare,
  'check': FaCheck,
  'settings': FaCog,
  'delete': FaTrash,
  'edit': FaEdit,
  'layers': FaLayerGroup,
  'type': FaFont,
  'add': FaPlus,
  'remove': FaMinus,
  'show': FaEye,
  'hide': FaEyeSlash,
  'undo': FaUndo,
  'redo': FaRedo,
  'search': FaSearch,
  'copy': FaCopy,
  'paste': FaPaste,

  // Learning
  'lightbulb': FaLightbulb,
  'book': FaBook,
  'question': FaQuestionCircle,
  'graduation-cap': FaGraduationCap,
  'brain': FaBrain,
  'info': FaInfo,

  // Navigation
  'double-arrow': FaArrowsAltH,
  'arrow-right': FaArrowRight,
  'arrow-left': FaArrowLeft,
  'arrow-up': FaArrowUp,
  'arrow-down': FaArrowDown,
  'chevron-right': FaChevronRight,
  'chevron-left': FaChevronLeft,
  'chevron-up': FaChevronUp,
  'chevron-down': FaChevronDown,
  'move': FaArrowsAlt,

  // Notifications
  'warning': FaExclamationTriangle,
  'exclamation': FaExclamationCircle,
  'info-circle': FaInfoCircle,
  'bell': FaBell,
  'bell-off': FaBellSlash,
  'error': FaTimesCircle,
  'success': FaCheckCircle,

  // Security
  'shield': FaShieldAlt,
  'key': FaKey,
  'fingerprint': FaFingerprint,
  'user-lock': FaUserLock,
  'user-shield': FaUserShield,
  'id-badge': FaIdBadge,
  'lock': FaLock,
  'unlock': FaUnlock,

  // Time
  'hourglass': FaHourglassHalf,
  'clock': FaClock,
  'stopwatch': FaStopwatch,
  'history': FaHistory,
  'calendar': FaCalendarAlt,
  'calendar-check': FaCalendarCheck,

  // Tools
  'wrench': FaWrench,
  'toolset': FaTools,
  'toolbox': FaToolbox,
  'hammer': FaHammer,
  'screwdriver': FaScrewdriver,
  'gears': FaCogs,
  'sliders': FaSlidersH,
  'magic-wand': FaMagic,

  // Weather & Nature
  'lightning': FaBolt,
  'water-drop': FaTint,
  'rain-cloud': FaCloud,
  'thermometer': FaThermometerHalf,
  'sun': FaSun
};
