# AnonymizerTS

A TypeScript implementation of Microsoft Presidio for PII (Personally Identifiable Information) detection and anonymization, powered by [Transformers.js v4](https://huggingface.co/blog/transformersjs-v4).

## Features

- 🔍 **PII Detection**: Automatically detect sensitive information in text
  - Named Entity Recognition (NER) using transformer models
  - Pattern-based recognition for emails, phone numbers, credit cards, SSNs, etc.
  
- 🛡️ **Anonymization**: Multiple anonymization strategies
  - **Redact**: Replace with entity type label (e.g., `<PERSON>`)
  - **Replace**: Substitute with custom values
  - **Mask**: Partial obfuscation (e.g., `***-**-1234`)
  - **Hash**: One-way cryptographic transformation

- 🚀 **Powered by Transformers.js**: Run state-of-the-art NLP models directly in Node.js/Browser
- 📦 **Zero Python Dependencies**: Pure TypeScript implementation
- 🎯 **Easy to Use**: Simple, intuitive API

## Supported Entity Types

- `PERSON` - Person names
- `LOCATION` - Geographic locations
- `ORGANIZATION` - Companies, institutions
- `EMAIL_ADDRESS` - Email addresses
- `PHONE_NUMBER` - Phone numbers
- `CREDIT_CARD` - Credit card numbers
- `US_SSN` - US Social Security Numbers
- `IP_ADDRESS` - IP addresses
- `URL` - Web URLs

## Installation

```bash
npm install @siddicky/anonymizerts
```

## Quick Start

```typescript
import { PresidioAnalyzer, PresidioAnonymizer, OperatorType } from '@siddicky/anonymizerts';

async function anonymizeText() {
  // Initialize analyzer
  const analyzer = new PresidioAnalyzer({ useNER: true });
  await analyzer.initialize();

  // Analyze text
  const text = "John Smith's email is john@email.com and phone is (555) 123-4567";
  const results = await analyzer.analyze(text);

  // Anonymize
  const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
  const anonymized = anonymizer.anonymize(text, results);
  
  console.log(anonymized.text);
  // Output: "<PERSON>'s email is <EMAIL_ADDRESS> and phone is <PHONE_NUMBER>"
}

anonymizeText();
```

## Usage Examples

### Example 1: Redact All PII

```typescript
import { PresidioAnalyzer, PresidioAnonymizer, OperatorType } from '@siddicky/anonymizerts';

const analyzer = new PresidioAnalyzer({ useNER: true });
await analyzer.initialize();

const text = "Contact John at john@email.com or call 555-1234";
const results = await analyzer.analyze(text);

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results);

console.log(anonymized.text);
// "Contact <PERSON> at <EMAIL_ADDRESS> or call <PHONE_NUMBER>"
```

### Example 2: Selective Masking

```typescript
import { EntityType, OperatorType } from '@siddicky/anonymizerts';

const operators = new Map();

// Mask phone numbers (show only first 3 digits)
operators.set(EntityType.PHONE_NUMBER, {
  type: OperatorType.MASK,
  maskingChar: '*',
  charsToMask: 7,
  fromEnd: true,
});

// Hash SSNs
operators.set(EntityType.US_SSN, {
  type: OperatorType.HASH,
});

const anonymized = anonymizer.anonymize(text, results, operators);
```

### Example 3: Custom Replacements

```typescript
const operators = new Map();

operators.set(EntityType.PERSON, {
  type: OperatorType.REPLACE,
  newValue: '[REDACTED]',
});

operators.set(EntityType.EMAIL_ADDRESS, {
  type: OperatorType.REPLACE,
  newValue: 'privacy@example.com',
});

const anonymized = anonymizer.anonymize(text, results, operators);
```

### Example 4: Pattern-Only (No NER)

For faster processing without NER models:

```typescript
const analyzer = new PresidioAnalyzer({ useNER: false });
// No need to call initialize() when NER is disabled

const results = await analyzer.analyze(text);
```

## API Reference

### PresidioAnalyzer

**Constructor Options:**
- `useNER?: boolean` - Enable NER-based recognition (default: true)
- `modelName?: string` - Hugging Face model name (default: 'Xenova/bert-base-NER')

**Methods:**
- `initialize(): Promise<void>` - Load NER model (required if useNER is true)
- `analyze(text: string, entities?: EntityType[]): Promise<RecognizerResult[]>` - Analyze text for PII

### PresidioAnonymizer

**Constructor:**
- `defaultOperator: OperatorConfig` - Default anonymization operator

**Methods:**
- `anonymize(text: string, results: RecognizerResult[], operators?: Map<EntityType, OperatorConfig>): AnonymizerResult`

### OperatorConfig

```typescript
interface OperatorConfig {
  type: OperatorType;
  newValue?: string;          // For REPLACE operator
  maskingChar?: string;       // For MASK operator (default: '*')
  charsToMask?: number;       // For MASK operator
  fromEnd?: boolean;          // For MASK operator
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run example
npm run example
```

## Architecture

AnonymizerTS follows Microsoft Presidio's architecture:

1. **Analyzer**: Detects PII using multiple recognizers
   - NERRecognizer: Uses transformers.js for named entity recognition
   - PatternRecognizer: Regex-based patterns for structured data

2. **Anonymizer**: Applies anonymization operators to detected entities
   - Supports multiple strategies per entity type
   - Maintains text structure and readability

## License

MIT

## Credits

- Inspired by [Microsoft Presidio](https://github.com/microsoft/presidio)
- Powered by [Transformers.js](https://huggingface.co/docs/transformers.js)
- Built with ❤️ by [@siddicky](https://github.com/siddicky)
