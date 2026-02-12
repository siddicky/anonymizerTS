import { EntityType, RecognizerResult } from './types.js';

/**
 * Pattern-based recognizers for common PII types
 */
export class PatternRecognizer {
  /**
   * Recognize email addresses
   */
  static recognizeEmail(text: string): RecognizerResult[] {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return this.findMatches(text, emailPattern, EntityType.EMAIL_ADDRESS, 0.9);
  }

  /**
   * Recognize phone numbers (US format)
   */
  static recognizePhone(text: string): RecognizerResult[] {
    const phonePattern = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    return this.findMatches(text, phonePattern, EntityType.PHONE_NUMBER, 0.85);
  }

  /**
   * Recognize credit card numbers
   */
  static recognizeCreditCard(text: string): RecognizerResult[] {
    const ccPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
    return this.findMatches(text, ccPattern, EntityType.CREDIT_CARD, 0.8);
  }

  /**
   * Recognize US Social Security Numbers
   */
  static recognizeSSN(text: string): RecognizerResult[] {
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    return this.findMatches(text, ssnPattern, EntityType.US_SSN, 0.9);
  }

  /**
   * Recognize IP addresses
   */
  static recognizeIPAddress(text: string): RecognizerResult[] {
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    return this.findMatches(text, ipPattern, EntityType.IP_ADDRESS, 0.85);
  }

  /**
   * Recognize URLs
   */
  static recognizeURL(text: string): RecognizerResult[] {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return this.findMatches(text, urlPattern, EntityType.URL, 0.9);
  }

  /**
   * Helper method to find pattern matches and create RecognizerResult objects
   */
  private static findMatches(
    text: string,
    pattern: RegExp,
    entityType: EntityType,
    score: number
  ): RecognizerResult[] {
    const results: RecognizerResult[] = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      results.push({
        entityType,
        start: match.index,
        end: match.index + match[0].length,
        score,
        text: match[0],
      });
    }

    return results;
  }

  /**
   * Run all pattern recognizers
   */
  static recognizeAll(text: string): RecognizerResult[] {
    return [
      ...this.recognizeEmail(text),
      ...this.recognizePhone(text),
      ...this.recognizeCreditCard(text),
      ...this.recognizeSSN(text),
      ...this.recognizeIPAddress(text),
      ...this.recognizeURL(text),
    ];
  }
}
