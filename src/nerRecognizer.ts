import { pipeline } from '@huggingface/transformers';
import { EntityType, RecognizerResult } from './types.js';

/**
 * NER-based recognizer using transformers.js
 */
export class NERRecognizer {
  private nerPipeline: any = null;
  private modelName: string;

  constructor(modelName: string = 'Xenova/bert-base-NER') {
    this.modelName = modelName;
  }

  /**
   * Initialize the NER pipeline
   */
  async initialize(): Promise<void> {
    if (!this.nerPipeline) {
      console.log('Loading NER model...');
      this.nerPipeline = await pipeline('token-classification', this.modelName);
      console.log('NER model loaded successfully');
    }
  }

  /**
   * Map NER entity types to our EntityType enum
   */
  private mapEntityType(nerType: string): EntityType | null {
    const typeMap: { [key: string]: EntityType } = {
      PER: EntityType.PERSON,
      PERSON: EntityType.PERSON,
      LOC: EntityType.LOCATION,
      LOCATION: EntityType.LOCATION,
      ORG: EntityType.ORGANIZATION,
      ORGANIZATION: EntityType.ORGANIZATION,
    };

    const normalized = nerType.replace(/^[BI]-/, '');
    return typeMap[normalized] || null;
  }

  /**
   * Recognize entities using NER model
   */
  async recognize(text: string): Promise<RecognizerResult[]> {
    if (!this.nerPipeline) {
      await this.initialize();
    }

    const nerResults = await this.nerPipeline(text);
    const results: RecognizerResult[] = [];
    
    if (!Array.isArray(nerResults) || nerResults.length === 0) {
      return results;
    }

    // Merge consecutive tokens of the same entity type
    let currentEntity: RecognizerResult | null = null;

    for (const result of nerResults) {
      const entityType = this.mapEntityType(result.entity);
      
      if (!entityType) continue;

      const start = result.start || 0;
      const end = result.end || start + (result.word?.length || 0);

      if (
        currentEntity &&
        currentEntity.entityType === entityType &&
        currentEntity.end >= start - 1
      ) {
        // Extend current entity
        currentEntity.end = end;
        currentEntity.text = text.substring(currentEntity.start, currentEntity.end);
        currentEntity.score = Math.max(currentEntity.score, result.score);
      } else {
        // Save previous entity if exists
        if (currentEntity) {
          results.push(currentEntity);
        }

        // Start new entity
        currentEntity = {
          entityType,
          start,
          end,
          score: result.score,
          text: text.substring(start, end),
        };
      }
    }

    // Add the last entity
    if (currentEntity) {
      results.push(currentEntity);
    }

    return results;
  }
}
