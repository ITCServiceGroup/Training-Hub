import { describe, expect, it } from 'vitest';
import TextFormatter from './textFormatting.js';

describe('TextFormatter', () => {
  describe('validateUrl', () => {
    it.each([
      ['https://example.com', 'https://example.com/'],
      ['http://example.com', 'http://example.com/'],
      ['example.com', 'https://example.com/'],
      ['www.example.com/path', 'https://www.example.com/path']
    ])('normalizes %s', (input, expected) => {
      expect(TextFormatter.validateUrl(input)).toMatchObject({
        isValid: true,
        normalizedUrl: expected
      });
    });

    it.each([
      '',
      'not-a-url',
      'http://',
      'https://',
      'ftp://example.com',
      'javascript:alert(1)',
      'localhost:3000',
      '127.0.0.1',
      '10.0.0.1',
      '172.16.0.1',
      '192.168.1.1'
    ])('rejects unsafe or invalid URL %s', input => {
      const result = TextFormatter.validateUrl(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual(expect.any(String));
    });
  });

  it('exposes the supported format and tag mappings', () => {
    expect(TextFormatter.FORMATS).toEqual({
      BOLD: 'bold',
      ITALIC: 'italic',
      UNDERLINE: 'underline',
      LINK: 'link'
    });
    expect(TextFormatter.TAG_MAP).toEqual({
      bold: 'strong',
      italic: 'em',
      underline: 'u',
      link: 'a'
    });
  });
});
