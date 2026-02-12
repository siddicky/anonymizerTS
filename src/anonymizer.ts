import * as crypto from 'crypto';
import {
  RecognizerResult,
  OperatorType,
  OperatorConfig,
  AnonymizerResult,
  EntityType,
} from './types.js';

/**
 * Anonymizer that applies various anonymization operators to detected entities
 */
export class PresidioAnonymizer {
  private defaultOperator: OperatorConfig;

  constructor(defaultOperator: OperatorConfig = { type: OperatorType.REDACT }) {
    this.defaultOperator = defaultOperator;
  }

  /**
   * Anonymize text based on analyzer results
   */
  anonymize(
    text: string,
    analyzerResults: RecognizerResult[],
    operators?: Map<EntityType, OperatorConfig>
  ): AnonymizerResult {
    // Sort results by position in reverse order to maintain correct indices
    const sortedResults = [...analyzerResults].sort((a, b) => b.start - a.start);

    let anonymizedText = text;
    const items: AnonymizerResult['items'] = [];

    for (const result of sortedResults) {
      const operator = operators?.get(result.entityType) || this.defaultOperator;
      const anonymizedValue = this.applyOperator(result.text, operator, result.entityType);

      // Replace in text
      anonymizedText =
        anonymizedText.substring(0, result.start) +
        anonymizedValue +
        anonymizedText.substring(result.end);

      // Track the change (positions relative to original text)
      items.push({
        start: result.start,
        end: result.start + anonymizedValue.length,
        entityType: result.entityType,
        text: anonymizedValue,
        operator: operator.type,
      });
    }

    // Reverse items to maintain original order
    items.reverse();

    return {
      text: anonymizedText,
      items,
    };
  }

  /**
   * Apply specific operator to a value
   */
  private applyOperator(
    value: string,
    operator: OperatorConfig,
    entityType: EntityType
  ): string {
    switch (operator.type) {
      case OperatorType.REDACT:
        return `<${entityType}>`;

      case OperatorType.REPLACE:
        return operator.newValue || `<${entityType}>`;

      case OperatorType.MASK:
        return this.maskValue(
          value,
          operator.maskingChar || '*',
          operator.charsToMask,
          operator.fromEnd
        );

      case OperatorType.HASH:
        return this.hashValue(value);

      default:
        return `<${entityType}>`;
    }
  }

  /**
   * Mask a value with a specified character
   */
  private maskValue(
    value: string,
    maskingChar: string,
    charsToMask?: number,
    fromEnd?: boolean
  ): string {
    if (!charsToMask || charsToMask >= value.length) {
      return maskingChar.repeat(value.length);
    }

    if (fromEnd) {
      const keepCount = value.length - charsToMask;
      return value.substring(0, keepCount) + maskingChar.repeat(charsToMask);
    } else {
      const keepCount = value.length - charsToMask;
      return maskingChar.repeat(charsToMask) + value.substring(charsToMask);
    }
  }

  /**
   * Hash a value using SHA-256
   */
  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }
}
