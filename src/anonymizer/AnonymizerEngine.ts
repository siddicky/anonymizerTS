import { RecognizerResult, AnonymizerResult, OperatorConfig, OperatorType, EntityType } from '../types';
import { OperatorFactory, Operator } from './Operators';

/**
 * Configuration for anonymization
 */
export interface AnonymizerConfig {
  defaultOperator?: OperatorConfig;
  operatorsByEntity?: Map<EntityType | string, OperatorConfig>;
}

/**
 * Main Anonymizer engine for de-identifying text
 */
export class AnonymizerEngine {
  private defaultOperator: OperatorConfig;
  private operatorsByEntity: Map<string, OperatorConfig>;

  constructor(config: AnonymizerConfig = {}) {
    this.defaultOperator = config.defaultOperator || {
      type: OperatorType.REPLACE,
      newValue: '<ANONYMIZED>'
    };
    
    this.operatorsByEntity = new Map();
    if (config.operatorsByEntity) {
      config.operatorsByEntity.forEach((value, key) => {
        this.operatorsByEntity.set(key.toString(), value);
      });
    }
  }

  /**
   * Anonymize text based on analyzer results
   * @param text The original text
   * @param analyzerResults Results from the analyzer
   * @returns Anonymized text and metadata
   */
  anonymize(text: string, analyzerResults: RecognizerResult[]): AnonymizerResult {
    if (!text || analyzerResults.length === 0) {
      return {
        text,
        items: []
      };
    }

    // Sort results by start position in reverse order
    // This allows us to replace from end to beginning, maintaining correct positions
    const sortedResults = [...analyzerResults].sort((a, b) => b.start - a.start);

    let anonymizedText = text;
    const items: AnonymizerResult['items'] = [];

    for (const result of sortedResults) {
      // Get the appropriate operator for this entity type
      const operatorConfig = this.operatorsByEntity.get(result.entityType.toString()) 
        || this.defaultOperator;
      
      const operator = OperatorFactory.createOperator(operatorConfig);

      // Store original positions and text
      const originalText = anonymizedText.substring(result.start, result.end);
      
      // Apply the operator
      anonymizedText = operator.operate(anonymizedText, result.start, result.end);

      // Calculate new end position after anonymization
      const newEnd = result.start + (anonymizedText.length - text.length + (result.end - result.start));

      items.unshift({
        operator: operatorConfig.type,
        entityType: result.entityType.toString(),
        start: result.start,
        end: result.end,
        text: originalText
      });
    }

    return {
      text: anonymizedText,
      items: items.reverse() // Return in original order
    };
  }

  /**
   * Add or update operator for a specific entity type
   */
  addOperatorForEntity(entityType: EntityType | string, config: OperatorConfig): void {
    this.operatorsByEntity.set(entityType.toString(), config);
  }

  /**
   * Set default operator for all entities
   */
  setDefaultOperator(config: OperatorConfig): void {
    this.defaultOperator = config;
  }
}
