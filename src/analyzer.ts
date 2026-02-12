import { EntityType, RecognizerResult } from './types.js';
import { NERRecognizer } from './nerRecognizer.js';
import { PatternRecognizer } from './patternRecognizer.js';

/**
 * Main analyzer that combines NER and pattern-based recognition
 */
export class PresidioAnalyzer {
  private nerRecognizer: NERRecognizer;
  private useNER: boolean;

  constructor(options: { useNER?: boolean; modelName?: string } = {}) {
    this.useNER = options.useNER ?? true;
    this.nerRecognizer = new NERRecognizer(options.modelName);
  }

  /**
   * Initialize the analyzer (loads NER model if enabled)
   */
  async initialize(): Promise<void> {
    if (this.useNER) {
      await this.nerRecognizer.initialize();
    }
  }

  /**
   * Analyze text and return all detected entities
   */
  async analyze(
    text: string,
    entities?: EntityType[]
  ): Promise<RecognizerResult[]> {
    const results: RecognizerResult[] = [];

    // Run pattern-based recognizers
    const patternResults = PatternRecognizer.recognizeAll(text);
    results.push(...patternResults);

    // Run NER-based recognizer if enabled
    if (this.useNER) {
      const nerResults = await this.nerRecognizer.recognize(text);
      results.push(...nerResults);
    }

    // Filter by requested entity types if specified
    let filteredResults = entities
      ? results.filter((r) => entities.includes(r.entityType))
      : results;

    // Remove overlapping entities (keep higher score)
    filteredResults = this.removeOverlaps(filteredResults);

    // Sort by position
    filteredResults.sort((a, b) => a.start - b.start);

    return filteredResults;
  }

  /**
   * Remove overlapping entities, keeping the one with higher score
   */
  private removeOverlaps(results: RecognizerResult[]): RecognizerResult[] {
    if (results.length === 0) return results;

    // Sort by start position, then by score (descending)
    const sorted = [...results].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.score - a.score;
    });

    const filtered: RecognizerResult[] = [];

    for (const result of sorted) {
      const hasOverlap = filtered.some(
        (existing) =>
          (result.start >= existing.start && result.start < existing.end) ||
          (result.end > existing.start && result.end <= existing.end) ||
          (result.start <= existing.start && result.end >= existing.end)
      );

      if (!hasOverlap) {
        filtered.push(result);
      }
    }

    return filtered;
  }
}
