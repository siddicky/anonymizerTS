# anonymizerTS

A TypeScript implementation of [Microsoft Presidio](https://github.com/microsoft/presidio) using [Transformers.js v4](https://huggingface.co/docs/transformers.js) for detecting and anonymizing Personally Identifiable Information (PII) in text.

## Features

- 🔍 **PII Detection**: Detect various types of sensitive information including names, emails, phone numbers, credit cards, SSNs, and more
- 🤖 **AI-Powered NER**: Uses Transformers.js for Named Entity Recognition (persons, locations, organizations)
- 🎯 **Pattern Recognition**: Regex-based detection for structured data (emails, phones, credit cards, etc.)
- 🔒 **Multiple Anonymization Strategies**: Redact, replace, mask, hash, or encrypt sensitive data
- ⚙️ **Customizable**: Add custom recognizers and anonymization operators
- 🚀 **No Python Required**: Pure TypeScript/JavaScript implementation
- 🌐 **Browser & Node.js**: Works in both browser and server environments

## Installation

```bash
npm install @siddicky/anonymizerts
```

## Quick Start

```typescript
import { AnalyzerEngine, AnonymizerEngine, EntityType } from '@siddicky/anonymizerts';

async function main() {
  // Create analyzer with NER support
  const analyzer = new AnalyzerEngine({ useNer: true });
  
  // Sample text with PII
  const text = "John Smith's email is john@example.com and phone is 555-123-4567";
  
  // Detect PII
  const results = await analyzer.analyze(text);
  
  // Anonymize
  const anonymizer = new AnonymizerEngine();
  const anonymized = anonymizer.anonymize(text, results);
  
  console.log(anonymized.text);
  // Output: <ANONYMIZED>'s email is <ANONYMIZED> and phone is <ANONYMIZED>
}
```

## Supported Entity Types

### AI-Powered (NER)
- `PERSON` - Person names
- `LOCATION` - Geographic locations
- `ORGANIZATION` - Companies, institutions
- `DATE_TIME` - Dates and times

### Pattern-Based
- `EMAIL_ADDRESS` - Email addresses
- `PHONE_NUMBER` - Phone numbers (various formats)
- `CREDIT_CARD` - Credit card numbers (with Luhn validation)
- `IP_ADDRESS` - IPv4 addresses
- `URL` - Web URLs
- `US_SSN` - US Social Security Numbers
- `IBAN_CODE` - International Bank Account Numbers

## Usage Examples

### Basic Detection and Anonymization

```typescript
import { AnalyzerEngine, AnonymizerEngine } from '@siddicky/anonymizerts';

const analyzer = new AnalyzerEngine({ useNer: true });
const anonymizer = new AnonymizerEngine();

const text = "Contact John at john@example.com or call 555-0123";
const results = await analyzer.analyze(text);
const anonymized = anonymizer.anonymize(text, results);

console.log(anonymized.text);
```

### Custom Anonymization Operators

```typescript
import { AnalyzerEngine, AnonymizerEngine, EntityType, OperatorType } from '@siddicky/anonymizerts';

const analyzer = new AnalyzerEngine();
const anonymizer = new AnonymizerEngine();

// Mask email addresses
anonymizer.addOperatorForEntity(EntityType.EMAIL_ADDRESS, {
  type: OperatorType.REPLACE,
  newValue: '<EMAIL>'
});

// Mask phone numbers (keep last 4 digits)
anonymizer.addOperatorForEntity(EntityType.PHONE_NUMBER, {
  type: OperatorType.MASK,
  maskingChar: 'X',
  charsToMask: 7,
  fromEnd: false
});

// Hash SSNs
anonymizer.addOperatorForEntity(EntityType.US_SSN, {
  type: OperatorType.HASH,
  hashType: 'sha256'
});

const text = "SSN: 123-45-6789, Email: test@example.com, Phone: 555-1234";
const results = await analyzer.analyze(text);
const anonymized = anonymizer.anonymize(text, results);
```

### Selective Entity Detection

```typescript
const analyzer = new AnalyzerEngine({ useNer: true });

// Only detect emails and phone numbers
const results = await analyzer.analyze(text, [
  EntityType.EMAIL_ADDRESS,
  EntityType.PHONE_NUMBER
]);
```

### Custom Recognizers

```typescript
import { EntityRecognizer, RecognizerResult, EntityType } from '@siddicky/anonymizerts';

class CustomRecognizer implements EntityRecognizer {
  supportedEntities = [EntityType.CUSTOM];
  
  async analyze(text: string): Promise<RecognizerResult[]> {
    // Your custom detection logic
    return [];
  }
}

const analyzer = new AnalyzerEngine({
  customRecognizers: [new CustomRecognizer()]
});
```

## Anonymization Operators

### Redact
Removes the text completely:
```typescript
{ type: OperatorType.REDACT }
```

### Replace
Replaces with a placeholder:
```typescript
{ type: OperatorType.REPLACE, newValue: '<REDACTED>' }
```

### Mask
Masks characters:
```typescript
{
  type: OperatorType.MASK,
  maskingChar: '*',
  charsToMask: 4,  // -1 for all
  fromEnd: true    // mask from end or beginning
}
```

### Hash
Replaces with hash:
```typescript
{
  type: OperatorType.HASH,
  hashType: 'sha256'  // 'md5', 'sha256', 'sha512'
}
```

### Encrypt
Encrypts the value:
```typescript
{
  type: OperatorType.ENCRYPT,
  newValue: 'encryption-key'
}
```

## API Reference

### AnalyzerEngine

```typescript
class AnalyzerEngine {
  constructor(config?: AnalyzerConfig)
  analyze(text: string, entities?: EntityType[], language?: string): Promise<RecognizerResult[]>
  getSupportedEntities(): EntityType[]
  addRecognizer(recognizer: EntityRecognizer): void
}
```

### AnonymizerEngine

```typescript
class AnonymizerEngine {
  constructor(config?: AnonymizerConfig)
  anonymize(text: string, results: RecognizerResult[]): AnonymizerResult
  addOperatorForEntity(entityType: EntityType, config: OperatorConfig): void
  setDefaultOperator(config: OperatorConfig): void
}
```

## Running Examples

```bash
npm run example
```

## Building

```bash
npm run build
```

## Architecture

This implementation follows the architecture of Microsoft Presidio:

1. **Analyzer**: Detects PII using multiple recognizers
   - NER Recognizer (Transformers.js)
   - Pattern Recognizer (Regex)
   - Custom Recognizers

2. **Anonymizer**: De-identifies detected PII using configurable operators
   - Redact, Replace, Mask, Hash, Encrypt
   - Entity-specific operators

## Comparison with Microsoft Presidio

| Feature | Presidio (Python) | anonymizerTS |
|---------|------------------|--------------|
| NER | spaCy/Transformers | Transformers.js |
| Pattern Recognition | ✅ | ✅ |
| Anonymization | ✅ | ✅ |
| Image Redaction | ✅ | ❌ |
| Language | Python | TypeScript/JavaScript |
| Browser Support | ❌ | ✅ |
| No Runtime Dependencies | ❌ | ✅ |

## Performance Considerations

- **First Load**: NER models are downloaded and cached on first use
- **Offline Support**: Models are cached for offline use
- **Pattern-Only Mode**: Disable NER for faster processing: `useNer: false`
- **WebGPU**: Transformers.js v4 uses WebGPU for hardware acceleration

## License

MIT

## Credits

- Inspired by [Microsoft Presidio](https://github.com/microsoft/presidio)
- Powered by [Transformers.js](https://github.com/huggingface/transformers.js)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

