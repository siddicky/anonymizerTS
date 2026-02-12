/**
 * Supported entity types for PII detection
 */
export enum EntityType {
  PERSON = 'PERSON',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  PHONE_NUMBER = 'PHONE_NUMBER',
  CREDIT_CARD = 'CREDIT_CARD',
  LOCATION = 'LOCATION',
  DATE_TIME = 'DATE_TIME',
  IP_ADDRESS = 'IP_ADDRESS',
  URL = 'URL',
  US_SSN = 'US_SSN',
  ORGANIZATION = 'ORGANIZATION',
  IBAN_CODE = 'IBAN_CODE',
  NRP = 'NRP',  // National Registry Number
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  US_DRIVER_LICENSE = 'US_DRIVER_LICENSE',
  CUSTOM = 'CUSTOM'
}

/**
 * Result from entity recognition
 */
export interface RecognizerResult {
  entityType: EntityType | string;
  start: number;
  end: number;
  score: number;
  text?: string;
}

/**
 * Operator type for anonymization
 */
export enum OperatorType {
  REDACT = 'redact',
  REPLACE = 'replace',
  MASK = 'mask',
  HASH = 'hash',
  ENCRYPT = 'encrypt',
  CUSTOM = 'custom'
}

/**
 * Configuration for anonymization operator
 */
export interface OperatorConfig {
  type: OperatorType;
  newValue?: string;
  maskingChar?: string;
  hashType?: 'md5' | 'sha256' | 'sha512';
  charsToMask?: number;
  fromEnd?: boolean;
}

/**
 * Result from anonymization
 */
export interface AnonymizerResult {
  text: string;
  items: Array<{
    operator: string;
    entityType: string;
    start: number;
    end: number;
    text: string;
  }>;
}
