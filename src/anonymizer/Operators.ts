import * as crypto from 'crypto';
import { OperatorType, OperatorConfig } from '../types';

/**
 * Base interface for anonymization operators
 */
export interface Operator {
  operate(text: string, start: number, end: number): string;
}

/**
 * Redact operator - removes the text
 */
export class RedactOperator implements Operator {
  private replacement: string;

  constructor(replacement: string = '') {
    this.replacement = replacement;
  }

  operate(text: string, start: number, end: number): string {
    return text.substring(0, start) + this.replacement + text.substring(end);
  }
}

/**
 * Replace operator - replaces with a fixed value
 */
export class ReplaceOperator implements Operator {
  private newValue: string;

  constructor(newValue: string = '<ANONYMIZED>') {
    this.newValue = newValue;
  }

  operate(text: string, start: number, end: number): string {
    return text.substring(0, start) + this.newValue + text.substring(end);
  }
}

/**
 * Mask operator - masks characters
 */
export class MaskOperator implements Operator {
  private maskingChar: string;
  private charsToMask: number;
  private fromEnd: boolean;

  constructor(
    maskingChar: string = '*',
    charsToMask: number = -1,
    fromEnd: boolean = false
  ) {
    this.maskingChar = maskingChar;
    this.charsToMask = charsToMask;
    this.fromEnd = fromEnd;
  }

  operate(text: string, start: number, end: number): string {
    const entityText = text.substring(start, end);
    const entityLength = entityText.length;

    let maskedText: string;

    if (this.charsToMask === -1) {
      // Mask all characters
      maskedText = this.maskingChar.repeat(entityLength);
    } else {
      const numToMask = Math.min(this.charsToMask, entityLength);
      
      if (this.fromEnd) {
        // Mask from the end
        const visiblePart = entityText.substring(0, entityLength - numToMask);
        const maskedPart = this.maskingChar.repeat(numToMask);
        maskedText = visiblePart + maskedPart;
      } else {
        // Mask from the beginning
        const maskedPart = this.maskingChar.repeat(numToMask);
        const visiblePart = entityText.substring(numToMask);
        maskedText = maskedPart + visiblePart;
      }
    }

    return text.substring(0, start) + maskedText + text.substring(end);
  }
}

/**
 * Hash operator - replaces with hash
 */
export class HashOperator implements Operator {
  private hashType: 'md5' | 'sha256' | 'sha512';

  constructor(hashType: 'md5' | 'sha256' | 'sha512' = 'sha256') {
    this.hashType = hashType;
  }

  operate(text: string, start: number, end: number): string {
    const entityText = text.substring(start, end);
    const hash = crypto.createHash(this.hashType).update(entityText).digest('hex');
    return text.substring(0, start) + hash + text.substring(end);
  }
}

/**
 * Encrypt operator - encrypts the text
 */
export class EncryptOperator implements Operator {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  operate(text: string, start: number, end: number): string {
    const entityText = text.substring(start, end);
    
    // Simple XOR encryption for demonstration
    // In production, use proper encryption libraries
    const buffer = Buffer.from(entityText);
    const encrypted = Buffer.from(
      buffer.map((byte, i) => byte ^ this.key.charCodeAt(i % this.key.length))
    ).toString('base64');

    return text.substring(0, start) + encrypted + text.substring(end);
  }
}

/**
 * Factory for creating operators
 */
export class OperatorFactory {
  static createOperator(config: OperatorConfig): Operator {
    switch (config.type) {
      case OperatorType.REDACT:
        return new RedactOperator(config.newValue);
      
      case OperatorType.REPLACE:
        return new ReplaceOperator(config.newValue || '<ANONYMIZED>');
      
      case OperatorType.MASK:
        return new MaskOperator(
          config.maskingChar || '*',
          config.charsToMask || -1,
          config.fromEnd || false
        );
      
      case OperatorType.HASH:
        return new HashOperator(config.hashType || 'sha256');
      
      case OperatorType.ENCRYPT:
        if (!config.newValue) {
          throw new Error('Encryption key is required for ENCRYPT operator');
        }
        return new EncryptOperator(config.newValue);
      
      default:
        throw new Error(`Unsupported operator type: ${config.type}`);
    }
  }
}
