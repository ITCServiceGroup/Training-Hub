import { supabase } from '../../config/supabase';
import { extractTextFromContent, countSearchTermOccurrences } from '../../utils/contentTextExtractor';

/**
 * Search service for searching across sections, categories, study guides, and study guide content
 */
class SearchService {
  /**
   * Search across all content types (sections, categories, study guides, and content)
   * @param {string} query - Search query
   * @param {boolean} publishedOnly - Whether to return only published study guides
   * @returns {Promise<Object>} - Search results grouped by type
   */
  async searchAll(query, publishedOnly = true) {
    if (!query || query.trim() === '') {
      return {
        sections: [],
        categories: [],
        studyGuides: [],
        content: []
      };
    }

    try {
      // Run all searches in parallel for better performance
      const [
        sectionsResults,
        categoriesResults,
        studyGuidesResults,
        contentResults
      ] = await Promise.all([
        this.searchSections(query),
        this.searchCategories(query),
        this.searchStudyGuides(query, publishedOnly),
        this.searchStudyGuideContent(query, publishedOnly)
      ]);

      return {
        sections: sectionsResults,
        categories: categoriesResults,
        studyGuides: studyGuidesResults,
        content: contentResults
      };
    } catch (error) {
      console.error('Error searching all content:', error.message);
      throw error;
    }
  }

  /**
   * Search sections by name and description
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Matching sections
   */
  async searchSections(query) {
    try {
      const { data, error } = await supabase
        .from('v2_sections')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching sections:', error.message);
      return [];
    }
  }

  /**
   * Search categories by name and description
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Matching categories
   */
  async searchCategories(query) {
    try {
      const { data, error } = await supabase
        .from('v2_categories')
        .select('*, v2_sections(*)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('display_order', { nullsLast: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching categories:', error.message);
      return [];
    }
  }

  /**
   * Search study guides by title and description
   * @param {string} query - Search query
   * @param {boolean} publishedOnly - Whether to return only published study guides
   * @returns {Promise<Array>} - Matching study guides
   */
  async searchStudyGuides(query, publishedOnly = true) {
    try {
      let queryBuilder = supabase
        .from('v2_study_guides')
        .select('*, v2_categories(*, v2_sections(*))')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('display_order', { nullsLast: true });

      // If publishedOnly is true, only return published study guides
      if (publishedOnly) {
        queryBuilder = queryBuilder.eq('is_published', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching study guides:', error.message);
      return [];
    }
  }

  /**
   * Search within study guide content
   * @param {string} query - Search query
   * @param {boolean} publishedOnly - Whether to return only published study guides
   * @returns {Promise<Array>} - Study guides with matching content
   */
  async searchStudyGuideContent(query, publishedOnly = true) {
    try {
      // If query is too short, it might match too many things
      if (!query || query.length < 2) {
        return [];
      }

      // Escape special characters in the query for use in patterns
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Also create a lowercase version for case-insensitive matching
      const lowerQuery = query.toLowerCase();
      const escapedLowerQuery = lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create a more comprehensive search pattern to find content in different formats
      // This handles both plain text content and JSON content where the text might be in props.text
      const searchPatterns = [
        // Plain text search
        `content.ilike.%${query}%`,

        // Search in JSON text fields (for Craft.js content)
        // With various spacing patterns and escaped quotes
        `content.ilike.%"text":"${escapedQuery}%`,
        `content.ilike.%"text": "${escapedQuery}%`,
        `content.ilike.%"text":"${escapedLowerQuery}%`,
        `content.ilike.%"text": "${escapedLowerQuery}%`,

        // Double-escaped quotes (for double-stringified JSON)
        `content.ilike.%\\"text\\":\\"${escapedQuery}%`,
        `content.ilike.%\\"text\\": \\"${escapedQuery}%`,
        `content.ilike.%\\"text\\":\\"${escapedLowerQuery}%`,
        `content.ilike.%\\"text\\": \\"${escapedLowerQuery}%`,

        // Search in children fields
        `content.ilike.%"children":"${escapedQuery}%`,
        `content.ilike.%"children": "${escapedQuery}%`,
        `content.ilike.%\\"children\\":\\"${escapedQuery}%`,
        `content.ilike.%\\"children\\": \\"${escapedQuery}%`,

        // Search in childrenString fields
        `content.ilike.%"childrenString":"${escapedQuery}%`,
        `content.ilike.%"childrenString": "${escapedQuery}%`,
        `content.ilike.%\\"childrenString\\":\\"${escapedQuery}%`,
        `content.ilike.%\\"childrenString\\": \\"${escapedQuery}%`,

        // Search in HTML content
        `content.ilike.%>${escapedQuery}</%`,
        `content.ilike.%>${query}</%`,

        // Search for partial words in text fields
        `content.ilike.%text%${query}%`,
        `content.ilike.%props%${query}%`,

        // Search for words in any quoted string (more generic approach)
        `content.ilike.%"${escapedQuery}"%`,
        `content.ilike.%\\"${escapedQuery}\\"%`,

        // Search for words in any HTML-like content
        `content.ilike.%<p>%${query}%</p>%`,
        `content.ilike.%<div>%${query}%</div>%`,
        `content.ilike.%<span>%${query}%</span>%`,
        `content.ilike.%<h1>%${query}%</h1>%`,
        `content.ilike.%<h2>%${query}%</h2>%`,
        `content.ilike.%<h3>%${query}%</h3>%`,

        // Search for words in any JSON array
        `content.ilike.%[%"${escapedQuery}"%]%`,
        `content.ilike.%[%\\"${escapedQuery}\\"%]%`
      ];

      // For multi-word queries, also search for each word individually
      const words = query.split(/\s+/).filter(word => word.length > 2);
      if (words.length > 1) {
        words.forEach(word => {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          searchPatterns.push(`content.ilike.%"text":"%${escapedWord}%"%`);
          searchPatterns.push(`content.ilike.%\\"text\\":\\"%${escapedWord}%\\"%`);
        });
      }

      let queryBuilder = supabase
        .from('v2_study_guides')
        .select('*, v2_categories(*, v2_sections(*))')
        .or(searchPatterns.join(','))
        .order('display_order', { nullsLast: true });

      // If publishedOnly is true, only return published study guides
      if (publishedOnly) {
        queryBuilder = queryBuilder.eq('is_published', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      // Remove duplicates (same study guide might match multiple patterns)
      const uniqueData = data ? Array.from(new Map(data.map(item => [item.id, item])).values()) : [];

      // Pre-process the content to extract clean text
      // This will make the search results display cleaner text
      const processedData = uniqueData.map(item => {
        // Create a processed version with extracted text
        if (item.content) {
          // Store the original content
          item.originalContent = item.content;

          // Extract clean text from the content
          try {
            const extractedText = extractTextFromContent(item.content);
            if (extractedText && extractedText.trim()) {
              // Replace the content with the extracted text for display
              item.content = extractedText;

              // Log the extraction for debugging
              console.log(`Extracted ${extractedText.length} chars of text from study guide ${item.id} - "${item.title}"`);

              // Count occurrences using our consistent counting method
              const count = countSearchTermOccurrences(extractedText, query);

              // Store both the count and the original content for reference
              // This allows components to recalculate the count consistently if needed
              item.matchCount = count;
              item.originalContent = item.content; // Ensure original content is preserved
              console.log(`SearchService: Found ${count} occurrences of "${query}" in study guide ${item.id} - "${item.title}"`);
            }
          } catch (e) {
            console.error('Error extracting text from content:', e);
            // Keep the original content if extraction fails
          }
        }
        return item;
      });

      return processedData;
    } catch (error) {
      console.error('Error searching study guide content:', error.message);
      return [];
    }
  }
}

export const searchService = new SearchService();
