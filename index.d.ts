/**
 * AnonymizerTS - TypeScript implementation of Microsoft Presidio
 * Standalone declaration file for CJS/ESM interop compatibility
 */

/**
 * Entity types that can be detected
 */
export declare enum EntityType {
  PERSON = "PERSON",
  LOCATION = "LOCATION",
  ORGANIZATION = "ORGANIZATION",
  EMAIL_ADDRESS = "EMAIL_ADDRESS",
  PHONE_NUMBER = "PHONE_NUMBER",
  CREDIT_CARD = "CREDIT_CARD",
  US_SSN = "US_SSN",
  IP_ADDRESS = "IP_ADDRESS",
  URL = "URL",
  DATE_TIME = "DATE_TIME",
}

/**
 * Result of entity recognition
 */
export interface RecognizerResult {
  entityType: EntityType;
  start: number;
  end: number;
  score: number;
  text: string;
}

/**
 * Anonymization operator types
 */
export declare enum OperatorType {
  REDACT = "redact",
  REPLACE = "replace",
  MASK = "mask",
  HASH = "hash",
}

/**
 * Configuration for anonymization operators
 */
export interface OperatorConfig {
  type: OperatorType;
  newValue?: string;
  maskingChar?: string;
  charsToMask?: number;
  fromEnd?: boolean;
}

/**
 * Result after anonymization
 */
export interface AnonymizerResult {
  text: string;
  items: Array<{
    start: number;
    end: number;
    entityType: EntityType;
    text: string;
    operator: OperatorType;
  }>;
}

/**
 * Main analyzer that combines NER and pattern-based recognition
 */
export declare class PresidioAnalyzer {
  constructor(options?: { useNER?: boolean; modelName?: string });
  initialize(): Promise<void>;
  analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]>;
}

/**
 * Anonymizer that applies various anonymization operators to detected entities
 */
export declare class PresidioAnonymizer {
  constructor(defaultOperator?: OperatorConfig);
  anonymize(
    text: string,
    analyzerResults: RecognizerResult[],
    operators?: Map<EntityType, OperatorConfig>
  ): AnonymizerResult;
}

/**
 * NER-based recognizer using transformers.js
 */
export declare class NERRecognizer {
  constructor(modelName?: string);
  initialize(): Promise<void>;
  recognize(text: string): Promise<RecognizerResult[]>;
}

/**
 * Pattern-based recognizers for common PII types
 */
export declare class PatternRecognizer {
  static recognizeEmail(text: string): RecognizerResult[];
  static recognizePhone(text: string): RecognizerResult[];
  static recognizeCreditCard(text: string): RecognizerResult[];
  static recognizeSSN(text: string): RecognizerResult[];
  static recognizeIPAddress(text: string): RecognizerResult[];
  static recognizeURL(text: string): RecognizerResult[];
  static recognizeAll(text: string): RecognizerResult[];
}
