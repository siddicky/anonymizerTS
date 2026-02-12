# Quick Start Guide

This guide will help you get started with AnonymizerTS quickly.

## Installation

```bash
npm install @siddicky/anonymizerts
```

## Basic Usage

### 1. Pattern-Based Recognition (No Model Download Required)

The fastest way to get started is with pattern-based recognition, which doesn't require downloading any ML models:

```typescript
import { PresidioAnalyzer, PresidioAnonymizer, OperatorType } from '@siddicky/anonymizerts';

// Create analyzer without NER (faster, no model download)
const analyzer = new PresidioAnalyzer({ useNER: false });

// Analyze text
const text = "Contact me at john@email.com or call 555-1234";
const results = await analyzer.analyze(text);

// Anonymize
const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results);

console.log(anonymized.text);
// Output: "Contact me at <EMAIL_ADDRESS> or call <PHONE_NUMBER>"
```

### 2. NER-Based Recognition (Recommended for Best Results)

For detecting entities like person names, locations, and organizations, enable NER:

```typescript
import { PresidioAnalyzer, PresidioAnonymizer, OperatorType } from '@siddicky/anonymizerts';

// Create analyzer with NER
const analyzer = new PresidioAnalyzer({ useNER: true });

// Initialize (downloads model on first run, ~50MB)
await analyzer.initialize();

// Analyze text
const text = "John Smith works at Microsoft in Seattle";
const results = await analyzer.analyze(text);

// Anonymize
const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results);

console.log(anonymized.text);
// Output: "<PERSON> works at <ORGANIZATION> in <LOCATION>"
```

## Common Use Cases

### Use Case 1: Remove all PII

```typescript
const analyzer = new PresidioAnalyzer({ useNER: false });
const results = await analyzer.analyze(text);

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results);
```

### Use Case 2: Mask Phone Numbers and SSNs

```typescript
const analyzer = new PresidioAnalyzer({ useNER: false });
const results = await analyzer.analyze(text);

const operators = new Map();
operators.set(EntityType.PHONE_NUMBER, {
  type: OperatorType.MASK,
  maskingChar: '*',
  charsToMask: 7,
  fromEnd: true,
});
operators.set(EntityType.US_SSN, {
  type: OperatorType.HASH,
});

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results, operators);
```

### Use Case 3: Replace Names with Placeholders

```typescript
const analyzer = new PresidioAnalyzer({ useNER: true });
await analyzer.initialize();

const results = await analyzer.analyze(text);

const operators = new Map();
operators.set(EntityType.PERSON, {
  type: OperatorType.REPLACE,
  newValue: '[REDACTED]',
});

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results, operators);
```

### Use Case 4: Anonymize Only Specific Entity Types

```typescript
const analyzer = new PresidioAnalyzer({ useNER: false });
const results = await analyzer.analyze(text);

// Filter to only emails and phone numbers
const filtered = results.filter(r => 
  r.entityType === EntityType.EMAIL_ADDRESS || 
  r.entityType === EntityType.PHONE_NUMBER
);

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, filtered);
```

## Performance Tips

1. **Use Pattern-Only Mode for Speed**: If you only need to detect structured data (emails, phones, SSNs, etc.), disable NER:
   ```typescript
   const analyzer = new PresidioAnalyzer({ useNER: false });
   ```

2. **Reuse Analyzer Instance**: The NER model is loaded once during initialization, so reuse the analyzer:
   ```typescript
   const analyzer = new PresidioAnalyzer({ useNER: true });
   await analyzer.initialize(); // Only do this once
   
   // Use analyzer for multiple texts
   const results1 = await analyzer.analyze(text1);
   const results2 = await analyzer.analyze(text2);
   ```

3. **Filter Entity Types**: Only analyze for specific entity types:
   ```typescript
   const results = await analyzer.analyze(text, [
     EntityType.EMAIL_ADDRESS,
     EntityType.PHONE_NUMBER,
   ]);
   ```

## Next Steps

- Read the [full documentation](README.md)
- Check out the [examples](src/example-patterns.ts)
- Learn about [entity types and operators](README.md#supported-entity-types)
