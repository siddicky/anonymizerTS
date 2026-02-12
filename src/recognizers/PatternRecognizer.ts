import { RecognizerResult, EntityType } from '../types';

/**
 * Base interface for entity recognizers
 */
export interface EntityRecognizer {
  supportedEntities: EntityType[];
  analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]>;
}

/**
 * Pattern-based recognizer using regular expressions
 */
export class PatternRecognizer implements EntityRecognizer {
  public supportedEntities: EntityType[];
  private patterns: Map<EntityType, RegExp[]>;
  private contextWords: Map<EntityType, string[]>;

  constructor() {
    this.supportedEntities = [
      EntityType.EMAIL_ADDRESS,
      EntityType.PHONE_NUMBER,
      EntityType.CREDIT_CARD,
      EntityType.IP_ADDRESS,
      EntityType.URL,
      EntityType.US_SSN,
      EntityType.IBAN_CODE
    ];
    this.patterns = new Map();
    this.contextWords = new Map();
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Email pattern
    this.patterns.set(EntityType.EMAIL_ADDRESS, [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ]);

    // Phone patterns (various formats)
    this.patterns.set(EntityType.PHONE_NUMBER, [
      /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
    ]);

    // Credit card pattern (basic Luhn algorithm compatible)
    this.patterns.set(EntityType.CREDIT_CARD, [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g
    ]);

    // IP Address (IPv4)
    this.patterns.set(EntityType.IP_ADDRESS, [
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
    ]);

    // URL pattern
    this.patterns.set(EntityType.URL, [
      /\b(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*\b/gi,
      /\bwww\.[^\s/$.?#].[^\s]*\b/gi
    ]);

    // US SSN pattern
    this.patterns.set(EntityType.US_SSN, [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{9}\b/g
    ]);

    // IBAN pattern (simplified)
    this.patterns.set(EntityType.IBAN_CODE, [
      /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g
    ]);

    // Context words for better detection
    this.contextWords.set(EntityType.EMAIL_ADDRESS, ['email', 'e-mail', 'contact']);
    this.contextWords.set(EntityType.PHONE_NUMBER, ['phone', 'tel', 'mobile', 'cell']);
    this.contextWords.set(EntityType.CREDIT_CARD, ['card', 'credit', 'visa', 'mastercard']);
    this.contextWords.set(EntityType.US_SSN, ['ssn', 'social security']);
  }

  async analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]> {
    const results: RecognizerResult[] = [];
    const entitiesToCheck = entities || this.supportedEntities;

    for (const entityType of entitiesToCheck) {
      const patterns = this.patterns.get(entityType);
      if (!patterns) continue;

      for (const pattern of patterns) {
        const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
        
        for (const match of matches) {
          if (match.index === undefined) continue;

          const matchText = match[0];
          const start = match.index;
          const end = start + matchText.length;

          // Calculate score based on pattern match and context
          let score = 0.85; // Base score for pattern match
          
          // Boost score if context words are present nearby
          const contextWords = this.contextWords.get(entityType);
          if (contextWords) {
            const contextWindow = text.substring(Math.max(0, start - 50), Math.min(text.length, end + 50)).toLowerCase();
            for (const word of contextWords) {
              if (contextWindow.includes(word.toLowerCase())) {
                score = Math.min(0.95, score + 0.1);
                break;
              }
            }
          }

          // Additional validation for specific entities
          if (entityType === EntityType.CREDIT_CARD) {
            if (!this.validateCreditCard(matchText)) continue;
          }

          results.push({
            entityType,
            start,
            end,
            score,
            text: matchText
          });
        }
      }
    }

    return results;
  }

  private validateCreditCard(cardNumber: string): boolean {
    // Remove spaces and hyphens
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Must be 13-19 digits
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}
