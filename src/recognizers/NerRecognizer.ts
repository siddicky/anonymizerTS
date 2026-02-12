import { pipeline } from '@huggingface/transformers';
import { RecognizerResult, EntityType } from '../types';
import { EntityRecognizer } from './PatternRecognizer';

/**
 * NER-based recognizer using Transformers.js
 */
export class NerRecognizer implements EntityRecognizer {
  public supportedEntities: EntityType[];
  private nerPipeline: any;
  private modelName: string;
  private entityMapping: Map<string, EntityType>;

  constructor(modelName: string = 'Xenova/bert-base-NER') {
    this.modelName = modelName;
    this.supportedEntities = [
      EntityType.PERSON,
      EntityType.LOCATION,
      EntityType.ORGANIZATION,
      EntityType.DATE_TIME
    ];
    this.entityMapping = new Map();
    this.initializeEntityMapping();
  }

  private initializeEntityMapping(): void {
    // Map NER model labels to our EntityType
    this.entityMapping.set('PER', EntityType.PERSON);
    this.entityMapping.set('PERSON', EntityType.PERSON);
    this.entityMapping.set('B-PER', EntityType.PERSON);
    this.entityMapping.set('I-PER', EntityType.PERSON);
    
    this.entityMapping.set('LOC', EntityType.LOCATION);
    this.entityMapping.set('LOCATION', EntityType.LOCATION);
    this.entityMapping.set('B-LOC', EntityType.LOCATION);
    this.entityMapping.set('I-LOC', EntityType.LOCATION);
    this.entityMapping.set('GPE', EntityType.LOCATION);
    
    this.entityMapping.set('ORG', EntityType.ORGANIZATION);
    this.entityMapping.set('ORGANIZATION', EntityType.ORGANIZATION);
    this.entityMapping.set('B-ORG', EntityType.ORGANIZATION);
    this.entityMapping.set('I-ORG', EntityType.ORGANIZATION);
    
    this.entityMapping.set('DATE', EntityType.DATE_TIME);
    this.entityMapping.set('TIME', EntityType.DATE_TIME);
    this.entityMapping.set('B-DATE', EntityType.DATE_TIME);
    this.entityMapping.set('I-DATE', EntityType.DATE_TIME);
  }

  async initialize(): Promise<void> {
    if (!this.nerPipeline) {
      console.log(`Loading NER model: ${this.modelName}...`);
      this.nerPipeline = await pipeline('token-classification', this.modelName);
      console.log('NER model loaded successfully');
    }
  }

  async analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]> {
    await this.initialize();

    const nerResults = await this.nerPipeline(text);
    const results: RecognizerResult[] = [];
    const entitiesToCheck = entities || this.supportedEntities;

    // Group consecutive tokens that are part of the same entity
    let currentEntity: any = null;

    for (const token of nerResults) {
      const entityType = this.entityMapping.get(token.entity);
      
      if (!entityType || !entitiesToCheck.includes(entityType)) {
        if (currentEntity) {
          results.push(this.finalizeEntity(currentEntity, text));
          currentEntity = null;
        }
        continue;
      }

      // Check if this token is a continuation (I-) or beginning (B-) of an entity
      const isBeginning = token.entity.startsWith('B-');
      const isContinuation = token.entity.startsWith('I-');

      if (isBeginning || !currentEntity || currentEntity.entityType !== entityType) {
        // Start a new entity
        if (currentEntity) {
          results.push(this.finalizeEntity(currentEntity, text));
        }
        currentEntity = {
          entityType,
          start: token.start,
          end: token.end,
          scores: [token.score]
        };
      } else if (isContinuation && currentEntity && currentEntity.entityType === entityType) {
        // Continue the current entity
        currentEntity.end = token.end;
        currentEntity.scores.push(token.score);
      }
    }

    // Don't forget the last entity
    if (currentEntity) {
      results.push(this.finalizeEntity(currentEntity, text));
    }

    return results;
  }

  private finalizeEntity(entity: any, text: string): RecognizerResult {
    // Calculate average score
    const avgScore = entity.scores.reduce((a: number, b: number) => a + b, 0) / entity.scores.length;
    
    return {
      entityType: entity.entityType,
      start: entity.start,
      end: entity.end,
      score: avgScore,
      text: text.substring(entity.start, entity.end)
    };
  }
}
