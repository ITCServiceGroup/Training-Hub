import { 
  // Navigation & Arrows
  FaArrowRight,
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaChevronLeft,
  FaChevronUp,
  FaChevronDown,
  FaArrowsAlt,

  // Interface Elements
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

  // Content Types
  FaFile,
  FaFileAlt,
  FaImage,
  FaVideo,
  FaLink,
  FaList,
  FaTable,
  FaColumns,
  FaExpand,
  FaCompress,
  FaYoutube,

  // Data & Charts
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaChartArea,
  FaDatabase,
  FaTachometerAlt,

  // Notifications & Alerts
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaBell,
  FaBellSlash,
  FaTimesCircle,
  FaCheckCircle,

  // Learning & Knowledge
  FaLightbulb,
  FaBook,
  FaQuestionCircle,
  FaGraduationCap,
  FaBrain,
  FaInfo,

  // Security & Actions
  FaShieldAlt,
  FaKey,
  FaFingerprint,
  FaUserLock,
  FaUserShield,
  FaIdBadge,
  FaUnlock,
  FaSave,
  FaDownload,
  FaUpload,
  FaShare,
  FaExternalLinkAlt,
  FaStar,
  FaHeart,
  FaLock
} from 'react-icons/fa';

// Map of icon names to display names (for UI), organized by category
export const ICON_CATEGORIES = {
  'Navigation': {
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
  'Content': {
    'file': 'File',
    'file-alt': 'Document',
    'image': 'Image',
    'video': 'Video',
    'link': 'Link',
    'list': 'List',
    'table': 'Table',
    'columns': 'Columns',
    'expand': 'Expand',
    'compress': 'Compress',
    'youtube': 'YouTube',
  },
  'Data & Charts': {
    'chart-bar': 'Bar Chart',
    'chart-line': 'Line Chart',
    'chart-pie': 'Pie Chart',
    'chart-area': 'Area Chart',
    'database': 'Database',
    'dashboard': 'Dashboard',
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
  'Learning': {
    'lightbulb': 'Idea',
    'book': 'Book',
    'question': 'Question',
    'graduation-cap': 'Education',
    'brain': 'Knowledge',
    'info': 'Info',
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
  'Actions': {
    'save': 'Save',
    'download': 'Download',
    'upload': 'Upload',
    'share': 'Share',
    'external-link': 'External Link',
    'star': 'Star',
    'heart': 'Heart'
  }
};

// Flatten categories into a single map for backward compatibility
export const ICON_NAME_MAP = Object.entries(ICON_CATEGORIES).reduce((acc, [category, icons]) => {
  return { ...acc, ...icons };
}, {});

// Map icon keys to their components
export const ICONS = {
  // Navigation & Arrows
  'arrow-right': FaArrowRight,
  'arrow-left': FaArrowLeft,
  'arrow-up': FaArrowUp,
  'arrow-down': FaArrowDown,
  'chevron-right': FaChevronRight,
  'chevron-left': FaChevronLeft,
  'chevron-up': FaChevronUp,
  'chevron-down': FaChevronDown,
  'move': FaArrowsAlt,

  // Interface Elements
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

  // Content Types
  'file': FaFile,
  'file-alt': FaFileAlt,
  'image': FaImage,
  'video': FaVideo,
  'link': FaLink,
  'list': FaList,
  'table': FaTable,
  'columns': FaColumns,
  'expand': FaExpand,
  'compress': FaCompress,
  'youtube': FaYoutube,

  // Data & Charts
  'chart-bar': FaChartBar,
  'chart-line': FaChartLine,
  'chart-pie': FaChartPie,
  'chart-area': FaChartArea,
  'database': FaDatabase,
  'dashboard': FaTachometerAlt,

  // Notifications
  'warning': FaExclamationTriangle,
  'exclamation': FaExclamationCircle,
  'info-circle': FaInfoCircle,
  'bell': FaBell,
  'bell-off': FaBellSlash,
  'error': FaTimesCircle,
  'success': FaCheckCircle,

  // Learning
  'lightbulb': FaLightbulb,
  'book': FaBook,
  'question': FaQuestionCircle,
  'graduation-cap': FaGraduationCap,
  'brain': FaBrain,
  'info': FaInfo,

  // Security and Access
  'shield': FaShieldAlt,
  'key': FaKey,
  'fingerprint': FaFingerprint,
  'user-lock': FaUserLock,
  'user-shield': FaUserShield,
  'id-badge': FaIdBadge,
  'lock': FaLock,
  'unlock': FaUnlock,

  // Actions
  'save': FaSave,
  'download': FaDownload,
  'upload': FaUpload,
  'share': FaShare,
  'external-link': FaExternalLinkAlt,
  'star': FaStar,
  'heart': FaHeart
};
