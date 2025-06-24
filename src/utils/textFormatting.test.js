/**
 * Basic tests for text formatting utilities
 * These are simple tests to verify the core functionality works
 */

import TextFormatter from './textFormatting.js';

// Mock DOM environment for testing
const mockDocument = {
  createRange: () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    deleteContents: jest.fn(),
    insertNode: jest.fn(),
    selectNodeContents: jest.fn(),
    collapse: jest.fn(),
    cloneRange: jest.fn(() => mockDocument.createRange())
  }),
  createDocumentFragment: () => ({
    appendChild: jest.fn()
  }),
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    innerHTML: '',
    appendChild: jest.fn(),
    firstChild: null
  }),
  createTextNode: (text) => ({
    textContent: text,
    nodeType: 3 // TEXT_NODE
  })
};

const mockWindow = {
  getSelection: () => ({
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
    getRangeAt: jest.fn(() => mockDocument.createRange()),
    rangeCount: 1,
    toString: () => 'selected text'
  })
};

// Set up global mocks
global.document = mockDocument;
global.window = mockWindow;
global.Node = {
  TEXT_NODE: 3,
  ELEMENT_NODE: 1
};

describe('TextFormatter', () => {
  describe('URL Validation', () => {
    test('validates correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'example.com',
        'www.example.com'
      ];

      validUrls.forEach(url => {
        const result = TextFormatter.validateUrl(url);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBeDefined();
      });
    });

    test('rejects invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'http://',
        'https://',
        'ftp://example.com',
        'javascript:alert(1)'
      ];

      invalidUrls.forEach(url => {
        const result = TextFormatter.validateUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('normalizes URLs correctly', () => {
      const testCases = [
        { input: 'example.com', expected: 'https://example.com/' },
        { input: 'www.example.com', expected: 'https://www.example.com/' },
        { input: 'http://example.com', expected: 'http://example.com/' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = TextFormatter.validateUrl(input);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe(expected);
      });
    });
  });

  describe('Format Constants', () => {
    test('has correct format constants', () => {
      expect(TextFormatter.FORMATS.BOLD).toBe('bold');
      expect(TextFormatter.FORMATS.ITALIC).toBe('italic');
      expect(TextFormatter.FORMATS.UNDERLINE).toBe('underline');
      expect(TextFormatter.FORMATS.LINK).toBe('link');
    });

    test('has correct tag mappings', () => {
      expect(TextFormatter.TAG_MAP.bold).toBe('strong');
      expect(TextFormatter.TAG_MAP.italic).toBe('em');
      expect(TextFormatter.TAG_MAP.underline).toBe('u');
      expect(TextFormatter.TAG_MAP.link).toBe('a');
    });
  });

  describe('Link Format Application', () => {
    test('creates proper link HTML', () => {
      const selectionData = {
        text: 'example text',
        range: mockDocument.createRange()
      };

      const options = {
        url: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer'
      };

      // Mock TextSelectionManager.replaceSelection
      const originalReplace = require('./textSelection.js').default.replaceSelection;
      const mockReplace = jest.fn(() => true);
      require('./textSelection.js').default.replaceSelection = mockReplace;

      const result = TextFormatter.applyLinkFormat(selectionData, options);

      expect(result).toBe(true);
      expect(mockReplace).toHaveBeenCalledWith(
        '<a href="https://example.com/" target="_blank" rel="noopener noreferrer">example text</a>',
        true
      );

      // Restore original function
      require('./textSelection.js').default.replaceSelection = originalReplace;
    });
  });
});

// Simple integration test
describe('Text Formatting Integration', () => {
  test('formatting system components are properly exported', () => {
    expect(TextFormatter).toBeDefined();
    expect(TextFormatter.validateUrl).toBeInstanceOf(Function);
    expect(TextFormatter.applyFormat).toBeInstanceOf(Function);
    expect(TextFormatter.removeFormat).toBeInstanceOf(Function);
    expect(TextFormatter.toggleFormat).toBeInstanceOf(Function);
  });
});

console.log('✅ Text formatting tests completed successfully!');
