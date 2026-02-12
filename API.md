# API Reference

Complete API documentation for AnonymizerTS.

## Table of Contents

- [PresidioAnalyzer](#presidioanalyzer)
- [PresidioAnonymizer](#presidioanonymizer)
- [NERRecognizer](#nerrecognizer)
- [PatternRecognizer](#patternrecognizer)
- [Types](#types)

---

## PresidioAnalyzer

Main analyzer class that combines NER and pattern-based recognition.

### Constructor

```typescript
new PresidioAnalyzer(options?: AnalyzerOptions)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `useNER` | `boolean` | `true` | Enable NER-based recognition |
| `modelName` | `string` | `'Xenova/bert-base-NER'` | Hugging Face model name for NER |

**Example:**

```typescript
// With NER
const analyzer = new PresidioAnalyzer({ useNER: true });

// Without NER (pattern-only)
const analyzer = new PresidioAnalyzer({ useNER: false });

// Custom NER model
const analyzer = new PresidioAnalyzer({ 
  useNER: true,
  modelName: 'dslim/bert-base-NER'
});
```

### Methods

#### `initialize(): Promise<void>`

Initializes the NER model. Must be called before `analyze()` if `useNER` is `true`.

**Example:**

```typescript
const analyzer = new PresidioAnalyzer({ useNER: true });
await analyzer.initialize();
```

#### `analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]>`

Analyzes text and returns detected PII entities.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `string` | Yes | Text to analyze |
| `entities` | `EntityType[]` | No | Filter to specific entity types |

**Returns:** `Promise<RecognizerResult[]>` - Array of detected entities

**Example:**

```typescript
// Detect all entities
const results = await analyzer.analyze(text);

// Detect only specific entity types
const results = await analyzer.analyze(text, [
  EntityType.EMAIL_ADDRESS,
  EntityType.PHONE_NUMBER,
]);
```

---

## PresidioAnonymizer

Anonymizer class that applies operators to detected entities.

### Constructor

```typescript
new PresidioAnonymizer(defaultOperator?: OperatorConfig)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `defaultOperator` | `OperatorConfig` | `{ type: OperatorType.REDACT }` | Default operator for all entities |

**Example:**

```typescript
// Default redaction
const anonymizer = new PresidioAnonymizer();

// Default masking
const anonymizer = new PresidioAnonymizer({ 
  type: OperatorType.MASK,
  maskingChar: '*'
});
```

### Methods

#### `anonymize(text: string, results: RecognizerResult[], operators?: Map<EntityType, OperatorConfig>): AnonymizerResult`

Anonymizes text based on analyzer results.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `string` | Yes | Original text |
| `results` | `RecognizerResult[]` | Yes | Detected entities from analyzer |
| `operators` | `Map<EntityType, OperatorConfig>` | No | Entity-specific operators |

**Returns:** `AnonymizerResult` - Anonymized text and metadata

**Example:**

```typescript
const results = await analyzer.analyze(text);

// Use default operator for all
const anonymized = anonymizer.anonymize(text, results);

// Use specific operators per entity type
const operators = new Map();
operators.set(EntityType.EMAIL_ADDRESS, {
  type: OperatorType.REPLACE,
  newValue: '<EMAIL>',
});
operators.set(EntityType.PHONE_NUMBER, {
  type: OperatorType.MASK,
  maskingChar: '*',
  charsToMask: 7,
  fromEnd: true,
});

const anonymized = anonymizer.anonymize(text, results, operators);
```

---

## NERRecognizer

Low-level NER recognition using transformers.js.

### Constructor

```typescript
new NERRecognizer(modelName?: string)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `modelName` | `string` | `'Xenova/bert-base-NER'` | Hugging Face model name |

### Methods

#### `initialize(): Promise<void>`

Loads the NER model.

#### `recognize(text: string): Promise<RecognizerResult[]>`

Recognizes named entities in text.

---

## PatternRecognizer

Static class for pattern-based recognition.

### Static Methods

#### `recognizeEmail(text: string): RecognizerResult[]`

Detects email addresses.

#### `recognizePhone(text: string): RecognizerResult[]`

Detects phone numbers (US format).

#### `recognizeCreditCard(text: string): RecognizerResult[]`

Detects credit card numbers.

#### `recognizeSSN(text: string): RecognizerResult[]`

Detects US Social Security Numbers.

#### `recognizeIPAddress(text: string): RecognizerResult[]`

Detects IP addresses.

#### `recognizeURL(text: string): RecognizerResult[]`

Detects URLs.

#### `recognizeAll(text: string): RecognizerResult[]`

Runs all pattern recognizers and returns combined results.

**Example:**

```typescript
import { PatternRecognizer, EntityType } from '@siddicky/anonymizerts';

const text = "Email: test@example.com, Phone: 555-1234";

// Detect all patterns
const results = PatternRecognizer.recognizeAll(text);

// Detect specific pattern
const emails = PatternRecognizer.recognizeEmail(text);
```

---

## Types

### EntityType

Enum of supported entity types.

```typescript
enum EntityType {
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
```

### OperatorType

Enum of anonymization operators.

```typescript
enum OperatorType {
  REDACT = 'redact',    // Replace with <ENTITY_TYPE>
  REPLACE = 'replace',  // Replace with custom value
  MASK = 'mask',        // Partial obfuscation
  HASH = 'hash',        // One-way hash
}
```

### RecognizerResult

Result from entity recognition.

```typescript
interface RecognizerResult {
  entityType: EntityType;  // Type of detected entity
  start: number;           // Start position in text
  end: number;             // End position in text
  score: number;           // Confidence score (0-1)
  text: string;            // Detected text
}
```

### OperatorConfig

Configuration for anonymization operators.

```typescript
interface OperatorConfig {
  type: OperatorType;      // Operator type
  newValue?: string;       // For REPLACE: replacement value
  maskingChar?: string;    // For MASK: character to use (default: '*')
  charsToMask?: number;    // For MASK: number of characters to mask
  fromEnd?: boolean;       // For MASK: mask from end instead of start
}
```

**Examples:**

```typescript
// Redact
{ type: OperatorType.REDACT }

// Replace with custom value
{ type: OperatorType.REPLACE, newValue: '[REDACTED]' }

// Mask last 4 characters
{ type: OperatorType.MASK, maskingChar: '*', charsToMask: 4, fromEnd: true }

// Hash
{ type: OperatorType.HASH }
```

### AnonymizerResult

Result from anonymization.

```typescript
interface AnonymizerResult {
  text: string;            // Anonymized text
  items: Array<{
    start: number;         // Start position in anonymized text
    end: number;           // End position in anonymized text
    entityType: EntityType;// Type of entity
    text: string;          // Anonymized value
    operator: OperatorType;// Operator used
  }>;
}
```

---

## Complete Example

```typescript
import {
  PresidioAnalyzer,
  PresidioAnonymizer,
  EntityType,
  OperatorType,
} from '@siddicky/anonymizerts';

async function main() {
  // Initialize analyzer
  const analyzer = new PresidioAnalyzer({ useNER: true });
  await analyzer.initialize();

  // Sample text
  const text = "John's email is john@example.com and SSN is 123-45-6789";

  // Analyze
  const results = await analyzer.analyze(text);

  // Configure operators
  const operators = new Map();
  operators.set(EntityType.PERSON, {
    type: OperatorType.REPLACE,
    newValue: '[NAME]',
  });
  operators.set(EntityType.EMAIL_ADDRESS, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 10,
  });
  operators.set(EntityType.US_SSN, {
    type: OperatorType.HASH,
  });

  // Anonymize
  const anonymizer = new PresidioAnonymizer();
  const anonymized = anonymizer.anonymize(text, results, operators);

  console.log(anonymized.text);
  // "[NAME]'s email is **********com and SSN is a1b2c3d4e5f6g7h8"
}
```
