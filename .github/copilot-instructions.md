# GitHub Copilot Instructions for anonymizerTS

## Project Overview

anonymizerTS is a TypeScript library for detecting and anonymizing personally identifiable information (PII) and sensitive data in text. The library provides entity detection and de-identification capabilities following the Microsoft Presidio architecture pattern.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Module System**: ES2020 modules (ESM)
- **Build Tool**: TypeScript Compiler (tsc)
- **Testing**: npm test suite
- **Package Manager**: npm
- **AI/ML**: transformers.js for Named Entity Recognition (NER)

## Coding Standards

### TypeScript Conventions

- Use TypeScript for all code with strict type checking
- Import ES module files with `.js` extensions (e.g., `import { Type } from './types.js'`)
  - This is required because `package.json` has `"type": "module"` and `tsconfig.json` uses `"module": "ES2020"`
- Follow existing naming conventions in the codebase
- Use proper TypeScript typing - avoid `any` types where possible

### Code Style

- Use consistent formatting that matches the existing codebase
- Write clear, descriptive variable and function names
- Keep functions focused and single-purpose
- Add comments only when necessary to explain complex logic

## Architecture Patterns

### Analyzer/Recognizer Pattern (Detection)

The library uses a dual-strategy approach for entity detection:

1. **NER Recognition**: Uses transformers.js for detecting names, locations, and organizations
   - Implementation: `src/nerRecognizer.ts` or `src/recognizers/NERRecognizer.ts`
   
2. **Pattern Recognition**: Uses regex patterns for structured data
   - Email addresses
   - Phone numbers
   - Social Security Numbers (SSNs)
   - Credit card numbers (with Luhn algorithm validation)
   - Implementation: `src/patternRecognizer.ts` or `src/recognizers/PatternRecognizer.ts`

3. **Analyzer Engine**: Coordinates recognition strategies
   - Implementation: `src/analyzer.ts` or `src/analyzer/AnalyzerEngine.ts`

### Anonymizer/Operator Pattern (De-identification)

The library provides four anonymization operators:

1. **REDACT**: Replace sensitive data with entity label (e.g., `<EMAIL>`)
2. **REPLACE**: Replace with a custom value
3. **MASK**: Partially hide with `*` or custom character
4. **HASH**: Hash using SHA-256

- Operators defined in: `src/types.ts` (OperatorType enum)
- Implementation: `src/anonymizer.ts` (applyOperator method) or `src/anonymizer/AnonymizerEngine.ts`
- Operator implementations may be in: `src/anonymizer/Operators.ts`

## Security Practices

### Security Requirements

- Always validate credit card numbers using the Luhn algorithm
  - See: `src/recognizers/PatternRecognizer.ts` (lines 125-147)
- Show security warnings for insecure operations (e.g., XOR encryption)
  - See: `src/anonymizer/Operators.ts` (lines 111-114)
- Use `html_escape` as a sanitizer to prevent cross-site scripting (XSS) vulnerabilities
- Never commit secrets or API keys to the repository
- Validate all user inputs, especially regex patterns and custom values

### When Adding Dependencies

- Check the GitHub Advisory Database for known vulnerabilities
- Prefer well-maintained packages with active security updates
- Document security-sensitive dependencies

## Build and Test Commands

### Building

```bash
npm run build
```

Uses TypeScript compiler (tsc) to compile the codebase.

### Testing

```bash
npm test          # Build and run full test suite
npm run test:quick   # Quick test run
npm run demo      # Run demo
```

### Development Workflow

1. Make code changes
2. Run `npm run build` to compile
3. Run `npm test` or `npm run test:quick` to verify changes
4. Ensure all tests pass before committing

## Best Practices

### When Making Changes

- Make minimal, focused changes that address the specific issue
- Update tests to cover new functionality
- Ensure backward compatibility unless breaking changes are explicitly required
- Update documentation when changing public APIs
- Run linters and tests before committing

### When Adding Features

- Follow the existing Analyzer/Recognizer or Anonymizer/Operator patterns
- Maintain consistency with the Microsoft Presidio architecture
- Add comprehensive tests for new features
- Document new entity types, operators, or configuration options

### When Fixing Bugs

- Add a test case that reproduces the bug
- Make the minimal change needed to fix the issue
- Verify the fix doesn't break existing functionality
- Consider edge cases

## File Structure

```
src/
├── types.ts                    # Type definitions and OperatorType enum
├── analyzer.ts                 # Entity detection coordination
├── anonymizer.ts              # Anonymization engine
├── nerRecognizer.ts           # NER-based entity recognition
├── patternRecognizer.ts       # Pattern-based entity recognition
└── analyzer/
    └── AnalyzerEngine.ts      # Alternative analyzer location
└── anonymizer/
    ├── AnonymizerEngine.ts    # Alternative anonymizer location
    └── Operators.ts           # Operator implementations
└── recognizers/
    ├── NERRecognizer.ts       # Alternative NER location
    └── PatternRecognizer.ts   # Alternative pattern location
```

Note: File structure may vary. Check the actual repository structure.

## Documentation

- Keep README.md up to date with API changes
- Document all public APIs with clear examples
- Include usage examples for new features
- Maintain changelog for version updates

## References

- [Microsoft Presidio Documentation](https://microsoft.github.io/presidio/) - Architecture inspiration
- [transformers.js](https://huggingface.co/docs/transformers.js/) - NER implementation
- TypeScript ES Module Guide - For understanding `.js` import extensions
