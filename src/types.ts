/**
 * Entity types that can be detected
 */
export enum EntityType {
  PERSON = 'PERSON',
  LOCATION = 'LOCATION',
  ORGANIZATION = 'ORGANIZATION',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  PHONE_NUMBER = 'PHONE_NUMBER',
  CREDIT_CARD = 'CREDIT_CARD',
  US_SSN = 'US_SSN',
  IP_ADDRESS = 'IP_ADDRESS',
  URL = 'URL',
  DATE_TIME = 'DATE_TIME',
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
export enum OperatorType {
  REDACT = 'redact',
  REPLACE = 'replace',
  MASK = 'mask',
  HASH = 'hash',
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
