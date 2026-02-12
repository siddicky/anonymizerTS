# Comparison with Microsoft Presidio

This document shows how AnonymizerTS compares to the original Microsoft Presidio Python library.

## Architecture Comparison

### Microsoft Presidio (Python)

```python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

# Analyzer
analyzer = AnalyzerEngine()
results = analyzer.analyze(text=text, language='en')

# Anonymizer
anonymizer = AnonymizerEngine()
anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
```

### AnonymizerTS (TypeScript)

```typescript
import { PresidioAnalyzer, PresidioAnonymizer } from '@siddicky/anonymizerts';

// Analyzer
const analyzer = new PresidioAnalyzer({ useNER: true });
await analyzer.initialize();
const results = await analyzer.analyze(text);

// Anonymizer
const anonymizer = new PresidioAnonymizer();
const anonymized = anonymizer.anonymize(text, results);
```

## Feature Comparison

| Feature | Presidio (Python) | AnonymizerTS | Notes |
|---------|------------------|--------------|-------|
| Named Entity Recognition | ✅ (spaCy) | ✅ (transformers.js) | Different models, similar results |
| Pattern-based Recognition | ✅ | ✅ | Regex patterns for structured data |
| Email Detection | ✅ | ✅ | |
| Phone Detection | ✅ | ✅ | US format supported |
| Credit Card Detection | ✅ | ✅ | |
| SSN Detection | ✅ | ✅ | US SSN format |
| Custom Recognizers | ✅ | 🔄 | Can be extended |
| Redaction | ✅ | ✅ | |
| Replacement | ✅ | ✅ | |
| Masking | ✅ | ✅ | |
| Hashing | ✅ | ✅ | SHA-256 |
| Encryption | ✅ | ❌ | Not yet implemented |
| Image Anonymization | ✅ | ❌ | Python-only feature |
| Structured Data | ✅ | 🔄 | Can be implemented |
| Multi-language | ✅ | 🔄 | Depends on NER model |
| Browser Support | ❌ | ✅ | TypeScript runs in browser |
| Zero Python Dependencies | ❌ | ✅ | |

✅ = Supported, ❌ = Not supported, 🔄 = Partially supported / Can be extended

## Key Differences

### 1. Runtime Environment

**Presidio:** Python-only
- Requires Python runtime
- Uses spaCy for NER
- Server-side only

**AnonymizerTS:** JavaScript/TypeScript
- Runs in Node.js or browser
- Uses transformers.js for NER
- Client-side and server-side

### 2. NER Models

**Presidio:** Uses spaCy models
```python
analyzer = AnalyzerEngine()  # Uses en_core_web_lg by default
```

**AnonymizerTS:** Uses Hugging Face transformers
```typescript
const analyzer = new PresidioAnalyzer({ 
  modelName: 'Xenova/bert-base-NER' 
});
```

### 3. Installation Size

**Presidio:**
- Python package + spaCy + NER models = ~500MB+

**AnonymizerTS:**
- NPM package + transformers.js + ONNX model = ~50MB

### 4. Pattern Recognition

Both use similar regex patterns for structured data:

**Presidio:**
```python
from presidio_analyzer import Pattern, PatternRecognizer

patterns = [Pattern("email", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", 0.5)]
email_recognizer = PatternRecognizer(supported_entity="EMAIL", patterns=patterns)
```

**AnonymizerTS:**
```typescript
const emails = PatternRecognizer.recognizeEmail(text);
```

## Usage Examples Side-by-Side

### Basic Anonymization

**Presidio:**
```python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

text = "John's email is john@example.com"

analyzer = AnalyzerEngine()
results = analyzer.analyze(text=text, language='en')

anonymizer = AnonymizerEngine()
anonymized = anonymizer.anonymize(text=text, analyzer_results=results)

print(anonymized.text)
```

**AnonymizerTS:**
```typescript
import { PresidioAnalyzer, PresidioAnonymizer, OperatorType } from '@siddicky/anonymizerts';

const text = "John's email is john@example.com";

const analyzer = new PresidioAnalyzer({ useNER: true });
await analyzer.initialize();
const results = await analyzer.analyze(text);

const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
const anonymized = anonymizer.anonymize(text, results);

console.log(anonymized.text);
```

### Custom Operators

**Presidio:**
```python
from presidio_anonymizer.entities import OperatorConfig

operators = {
    "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL>"}),
    "PHONE_NUMBER": OperatorConfig("mask", {"masking_char": "*", "chars_to_mask": 7, "from_end": True})
}

anonymized = anonymizer.anonymize(text=text, analyzer_results=results, operators=operators)
```

**AnonymizerTS:**
```typescript
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

## When to Use Which

### Use Microsoft Presidio (Python) when:
- You need image anonymization
- You require structured data support (CSV, JSON)
- You're already using Python/spaCy
- You need HIPAA/GDPR compliance features
- You need advanced custom recognizers
- You're building server-only applications

### Use AnonymizerTS when:
- You need browser-side anonymization
- You want zero Python dependencies
- You're building Node.js/TypeScript applications
- You need smaller deployment size
- You want to run PII detection client-side
- You're building real-time web applications

## Migration Guide

If you're migrating from Presidio to AnonymizerTS:

1. **Install AnonymizerTS:**
   ```bash
   npm install @siddicky/anonymizerts
   ```

2. **Update imports:**
   ```typescript
   // Python
   from presidio_analyzer import AnalyzerEngine
   from presidio_anonymizer import AnonymizerEngine

   // TypeScript
   import { PresidioAnalyzer, PresidioAnonymizer } from '@siddicky/anonymizerts';
   ```

3. **Initialize analyzer:**
   ```typescript
   // Python: analyzer = AnalyzerEngine()
   const analyzer = new PresidioAnalyzer({ useNER: true });
   await analyzer.initialize();
   ```

4. **Analyze text:**
   ```typescript
   // Python: results = analyzer.analyze(text=text, language='en')
   const results = await analyzer.analyze(text);
   ```

5. **Anonymize:**
   ```typescript
   // Python: anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
   const anonymized = anonymizer.anonymize(text, results);
   ```

## Performance

### Speed Comparison (approximate)

| Operation | Presidio (Python) | AnonymizerTS | Notes |
|-----------|------------------|--------------|-------|
| Model Load | ~2-5s | ~1-3s | First time only |
| Pattern Recognition | Very Fast | Very Fast | Similar performance |
| NER (100 words) | ~50-100ms | ~100-200ms | Depends on model |
| Anonymization | Very Fast | Very Fast | Similar performance |

### Memory Usage (approximate)

| Component | Presidio (Python) | AnonymizerTS |
|-----------|------------------|--------------|
| Runtime | ~50MB | ~30MB |
| NER Model | ~400MB | ~40MB |
| Total | ~450MB | ~70MB |

## Conclusion

AnonymizerTS provides a TypeScript/JavaScript alternative to Microsoft Presidio with:
- ✅ Similar API design and functionality
- ✅ Smaller footprint and faster initialization
- ✅ Browser and Node.js support
- ✅ Zero Python dependencies
- ⚠️ Some advanced features not yet implemented

Both libraries are excellent for PII detection and anonymization, with the choice depending on your runtime environment and specific requirements.
