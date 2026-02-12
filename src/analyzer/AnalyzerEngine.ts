import { RecognizerResult, EntityType } from '../types';
import { EntityRecognizer } from '../recognizers/PatternRecognizer';
import { PatternRecognizer } from '../recognizers/PatternRecognizer';
import { NerRecognizer } from '../recognizers/NerRecognizer';

/**
 * Configuration for the Analyzer
 */
export interface AnalyzerConfig {
  useNer?: boolean;
  nerModelName?: string;
  customRecognizers?: EntityRecognizer[];
  languages?: string[];
  scoreThreshold?: number;
}

/**
 * Main Analyzer class for detecting PII in text
 */
export class AnalyzerEngine {
  private recognizers: EntityRecognizer[];
  private scoreThreshold: number;
  private nerRecognizer?: NerRecognizer;
  private patternRecognizer: PatternRecognizer;

  constructor(config: AnalyzerConfig = {}) {
    this.recognizers = [];
    this.scoreThreshold = config.scoreThreshold || 0.5;
    
    // Initialize pattern recognizer
    this.patternRecognizer = new PatternRecognizer();
    this.recognizers.push(this.patternRecognizer);

    // Initialize NER recognizer if requested
    if (config.useNer !== false) {
      this.nerRecognizer = new NerRecognizer(config.nerModelName);
      this.recognizers.push(this.nerRecognizer);
    }

    // Add custom recognizers
    if (config.customRecognizers) {
      this.recognizers.push(...config.customRecognizers);
    }
  }

  /**
   * Analyze text for PII entities
   * @param text The text to analyze
   * @param entities Optional list of entity types to detect
   * @param language Optional language code (default: 'en')
   * @returns Array of detected entities
   */
  async analyze(
    text: string,
    entities?: EntityType[],
    language: string = 'en'
  ): Promise<RecognizerResult[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const allResults: RecognizerResult[] = [];

    // Run all recognizers
    for (const recognizer of this.recognizers) {
      try {
        const results = await recognizer.analyze(text, entities);
        allResults.push(...results);
      } catch (error) {
        const recognizerName = recognizer.constructor.name;
        console.error(`Error in recognizer ${recognizerName}:`, error);
      }
    }

    // Merge overlapping results and filter by threshold
    const mergedResults = this.mergeResults(allResults);
    
    return mergedResults.filter(result => result.score >= this.scoreThreshold);
  }

  /**
   * Merge overlapping results, keeping the one with highest score
   */
  private mergeResults(results: RecognizerResult[]): RecognizerResult[] {
    if (results.length === 0) return [];

    // Sort by start position
    const sorted = [...results].sort((a, b) => a.start - b.start);
    const merged: RecognizerResult[] = [];

    for (const current of sorted) {
      if (merged.length === 0) {
        merged.push(current);
        continue;
      }

      const last = merged[merged.length - 1];

      // Check if there's overlap
      if (current.start < last.end) {
        // Overlapping entities - keep the one with higher score
        if (current.score > last.score) {
          // If current has higher score and completely contains or extends last
          if (current.end >= last.end) {
            merged[merged.length - 1] = current;
          }
        } else {
          // If last has higher score, check if current extends beyond
          if (current.end > last.end) {
            // Extend the last result
            last.end = current.end;
            if (current.text) {
              last.text = current.text;
            }
          }
        }
      } else {
        // No overlap, add as new result
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Get all supported entity types from all recognizers
   */
  getSupportedEntities(): EntityType[] {
    const allEntities = new Set<EntityType>();
    
    for (const recognizer of this.recognizers) {
      for (const entity of recognizer.supportedEntities) {
        allEntities.add(entity);
      }
    }

    return Array.from(allEntities);
  }

  /**
   * Add a custom recognizer
   */
  addRecognizer(recognizer: EntityRecognizer): void {
    this.recognizers.push(recognizer);
  }
}
