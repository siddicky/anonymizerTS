# Changelog

All notable changes to AnonymizerTS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-12

### Added
- Initial release of AnonymizerTS
- TypeScript implementation of Microsoft Presidio for PII detection and anonymization
- NER-based entity recognition using Hugging Face transformers.js v4
- Pattern-based recognition for structured data:
  - Email addresses
  - Phone numbers (US format)
  - Credit card numbers
  - US Social Security Numbers
  - IP addresses
  - URLs
- Entity types supported:
  - PERSON (via NER)
  - LOCATION (via NER)
  - ORGANIZATION (via NER)
  - EMAIL_ADDRESS
  - PHONE_NUMBER
  - CREDIT_CARD
  - US_SSN
  - IP_ADDRESS
  - URL
  - DATE_TIME
- Anonymization operators:
  - REDACT: Replace with entity type label
  - REPLACE: Substitute with custom values
  - MASK: Partial obfuscation with configurable characters
  - HASH: One-way SHA-256 transformation
- PresidioAnalyzer class for PII detection
- PresidioAnonymizer class for PII anonymization
- NERRecognizer class for transformer-based NER
- PatternRecognizer class for regex-based detection
- Comprehensive test suite with 21 tests
- Full documentation:
  - README with examples
  - API reference
  - Quick start guide
  - Comparison with Microsoft Presidio
- Example code demonstrating all features
- TypeScript type definitions
- MIT License

### Features
- Works in both Node.js and browser environments
- Zero Python dependencies
- Smaller footprint than original Presidio (~70MB vs ~450MB)
- Similar API design to Microsoft Presidio
- Configurable NER models via Hugging Face
- Entity overlap detection and resolution
- Entity type filtering
- Per-entity-type anonymization operators

[1.0.0]: https://github.com/siddicky/anonymizerTS/releases/tag/v1.0.0
