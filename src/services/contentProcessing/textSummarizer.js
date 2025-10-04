/**
 * Text summarization service using extractive summarization techniques
 * Implements a simplified TextRank algorithm to extract key sentences
 * src/services/contentProcessing/textSummarizer.js
 */
export const textSummarizer = {
    /**
     * Summarize text by extracting the most important sentences
     * @param {string} text - The full text to summarize
     * @param {number} maxSentences - Maximum number of sentences to include
     * @param {number} maxChars - Maximum characters in the summary
     * @returns {string} - The summarized text
     */
    summarize(text, maxSentences = 3, maxChars = 280) {
      if (!text || typeof text !== 'string' || text.length === 0) {
        return '';
      }
      
      // Split text into sentences
      const sentences = this.splitIntoSentences(text);
      
      // For very short texts, just return as is or first sentence
      if (sentences.length === 0) {
        return this.truncateToFit(text, maxChars);
      }
      
      if (sentences.length <= 2) {
        return sentences[0] || '';
      }
      
      // Calculate word frequency
      const wordFrequency = this.calculateWordFrequency(text);
      
      // Score sentences based on word importance
      const scoredSentences = sentences.map((sentence, index) => {
        const score = this.scoreSentence(sentence, wordFrequency, index, sentences.length);
        return { sentence, score, index };
      });
      
      // Sort by score (descending)
      scoredSentences.sort((a, b) => b.score - a.score);
      
      // Get top sentences (up to maxSentences)
      const topSentences = scoredSentences.slice(0, Math.min(maxSentences, sentences.length));
      
      // Sort by original position to maintain flow
      topSentences.sort((a, b) => a.index - b.index);
      
      // Build summary
      let summary = topSentences.map(item => item.sentence).join(' ');
      
      // Truncate if necessary
      if (summary.length > maxChars) {
        summary = this.truncateToFit(summary, maxChars);
      }
      
      return summary;
    },
  
    /**
     * Split text into sentences with improved handling
     * @param {string} text - Text to split
     * @returns {string[]} - Array of sentences
     */
    splitIntoSentences(text) {
      if (!text || typeof text !== 'string') {
        return [];
      }
      
      // Remove extra whitespace
      text = text.replace(/\s+/g, ' ').trim();
      
      // Handle common abbreviations to prevent false splits
      const abbreviations = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Sr.', 'Jr.', 'etc.', 'vs.', 'e.g.', 'i.e.', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];
      const placeholder = '<<ABBR>>';
      
      abbreviations.forEach((abbr, index) => {
        const pattern = new RegExp(abbr.replace('.', '\\.'), 'g');
        text = text.replace(pattern, `${placeholder}${index}`);
      });
      
      // Split on sentence boundaries (. ! ?) followed by space and capital letter
      const sentenceRegex = /([.!?]+)\s+(?=[A-Z])/g;
      const parts = text.split(sentenceRegex);
      
      // Reconstruct sentences
      const sentences = [];
      for (let i = 0; i < parts.length; i += 2) {
        if (parts[i] && parts[i].trim().length > 0) {
          let sentence = parts[i];
          if (parts[i + 1]) {
            sentence += parts[i + 1];
          }
          sentences.push(sentence.trim());
        }
      }
      
      // Restore abbreviations
      const restoredSentences = sentences.map(sentence => {
        abbreviations.forEach((abbr, index) => {
          const pattern = new RegExp(`${placeholder}${index}`, 'g');
          sentence = sentence.replace(pattern, abbr);
        });
        return sentence;
      });
      
      // Filter out empty sentences and very short ones (likely artifacts)
      return restoredSentences.filter(s => s.length > 10 && s.split(/\s+/).length > 3);
    },
  
    /**
     * Calculate word frequency in the text
     * @param {string} text - The text to analyze
     * @returns {Object} - Map of words to their frequency
     */
    calculateWordFrequency(text) {
      if (!text || typeof text !== 'string') {
        return {};
      }
      
      // Normalize and split into words
      const words = text.toLowerCase()
        .replace(/[^\w\s'-]/g, '') // Keep hyphens and apostrophes
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      // Calculate frequency
      const frequency = {};
      words.forEach(word => {
        // Skip stop words and very short words
        if (this.isStopWord(word) || word.length < 3) {
          return;
        }
        frequency[word] = (frequency[word] || 0) + 1;
      });
      
      // Normalize frequencies
      const maxFreq = Math.max(...Object.values(frequency), 1);
      for (const word in frequency) {
        frequency[word] = frequency[word] / maxFreq;
      }
      
      return frequency;
    },
  
    /**
     * Score a sentence based on word importance
     * @param {string} sentence - The sentence to score
     * @param {Object} wordFrequency - Word frequency map
     * @param {number} index - Sentence position in original text
     * @param {number} totalSentences - Total number of sentences
     * @returns {number} - Sentence score
     */
    scoreSentence(sentence, wordFrequency, index, totalSentences) {
      if (!sentence || typeof sentence !== 'string') {
        return 0;
      }
      
      // Normalize sentence
      const words = sentence.toLowerCase()
        .replace(/[^\w\s'-]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);
      
      // Skip very short sentences
      if (words.length < 3) {
        return 0;
      }
      
      // Calculate base score from word frequency
      let score = 0;
      let scoredWordCount = 0;
      
      words.forEach(word => {
        if (!this.isStopWord(word) && word.length >= 3) {
          score += wordFrequency[word] || 0;
          scoredWordCount++;
        }
      });
      
      // Avoid division by zero
      if (scoredWordCount === 0) {
        return 0;
      }
      
      // Normalize by number of content words (not sentence length)
      score = score / scoredWordCount;
      
      // Position-based scoring
      // First sentence is usually important
      if (index === 0) {
        score *= 1.5;
      } 
      // Early sentences are generally more important
      else if (index < totalSentences * 0.2) {
        score *= 1.3;
      }
      // Last sentence can be important (conclusions)
      else if (index === totalSentences - 1) {
        score *= 1.2;
      }
      
      // Boost sentences containing key phrases
      const keyPhrases = [
        'importantly', 'in conclusion', 'to summarize', 'in summary', 
        'key', 'significant', 'primary', 'essential', 'critical',
        'main point', 'in other words', 'the result', 'therefore',
        'consequently', 'as a result'
      ];
      
      const sentenceLower = sentence.toLowerCase();
      keyPhrases.forEach(phrase => {
        if (sentenceLower.includes(phrase)) {
          score *= 1.3;
        }
      });
      
      // Penalize questions (usually less informative for summaries)
      if (sentence.includes('?')) {
        score *= 0.8;
      }
      
      // Penalize very long sentences (harder to extract)
      if (words.length > 40) {
        score *= 0.9;
      }
      
      return score;
    },
  
    /**
     * Check if a word is a stop word (common words with little meaning)
     * @param {string} word - The word to check
     * @returns {boolean} - True if the word is a stop word
     */
    isStopWord(word) {
      if (!word || typeof word !== 'string') {
        return true;
      }
      
      const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by',
        'for', 'from', 'has', 'have', 'he', 'her', 'here', 'hers', 'him',
        'his', 'how', 'i', 'if', 'in', 'is', 'it', 'its', 'me', 'my',
        'of', 'on', 'or', 'our', 'ours', 'she', 'so', 'than', 'that',
        'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
        'those', 'to', 'too', 'us', 'was', 'we', 'were', 'what', 'when',
        'where', 'which', 'who', 'whom', 'why', 'will', 'with', 'would',
        'you', 'your', 'yours', 'about', 'after', 'all', 'also', 'am',
        'another', 'any', 'because', 'before', 'being', 'between', 'both',
        'can', 'could', 'did', 'do', 'does', 'doing', 'during', 'each',
        'either', 'few', 'further', 'had', 'having', 'into', 'just',
        'may', 'might', 'more', 'most', 'much', 'must', 'no', 'nor',
        'not', 'now', 'off', 'once', 'only', 'other', 'over', 'own',
        'said', 'same', 'should', 'since', 'some', 'such', 'than',
        'through', 'under', 'until', 'up', 'very', 'while', 'shall',
        'get', 'got', 'like', 'made', 'make', 'many', 'one', 'two',
        'three', 'well', 'way', 'even', 'new', 'see', 'come', 'came'
      ]);
      
      return stopWords.has(word.toLowerCase());
    },
  
    /**
     * Truncate text to fit within a maximum length
     * @param {string} text - Text to truncate
     * @param {number} maxChars - Maximum characters allowed
     * @returns {string} - Truncated text
     */
    truncateToFit(text, maxChars) {
      if (!text || typeof text !== 'string') {
        return '';
      }
      
      if (text.length <= maxChars) {
        return text;
      }
      
      // Try to find a sentence break within the limit
      let truncated = text.substr(0, maxChars);
      
      // Look for sentence endings
      const sentenceEndings = ['. ', '! ', '? '];
      let bestBreak = -1;
      
      for (const ending of sentenceEndings) {
        const pos = truncated.lastIndexOf(ending);
        if (pos > maxChars * 0.5 && pos > bestBreak) {
          bestBreak = pos;
        }
      }
      
      if (bestBreak > 0) {
        return truncated.substr(0, bestBreak + 1);
      }
      
      // Fall back to word break
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > maxChars * 0.5) {
        return truncated.substr(0, lastSpace) + '...';
      }
      
      // Last resort: hard truncate
      return truncated + '...';
    }
  };