# Contributing to AnonymizerTS

Thank you for your interest in contributing to AnonymizerTS! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/anonymizerTS.git
   cd anonymizerTS
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Run tests**:
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the `src/` directory

3. **Build and test** your changes:
   ```bash
   npm run build
   npm test
   ```

4. **Run the examples** to verify functionality:
   ```bash
   npm run example
   ```

### Code Style

- Use TypeScript strict mode (already configured in `tsconfig.json`)
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use ES2020 module syntax with `.js` extensions in imports

### TypeScript Guidelines

- Always specify types explicitly (avoid `any` unless absolutely necessary)
- Use enums for fixed sets of values
- Use interfaces for data structures
- Export types from `types.ts` for reusability

### Testing

- Add tests for new features in `src/test.ts`
- Ensure all tests pass before submitting PR
- Test both pattern-based and NER-based recognition
- Include edge cases in tests

## Project Structure

```
anonymizerTS/
├── src/
│   ├── analyzer.ts          # Main analyzer combining recognizers
│   ├── anonymizer.ts        # Anonymization operators
│   ├── nerRecognizer.ts     # NER-based recognition
│   ├── patternRecognizer.ts # Pattern-based recognition
│   ├── types.ts             # Type definitions
│   ├── index.ts             # Public API exports
│   ├── example.ts           # NER example
│   ├── example-patterns.ts  # Pattern-only example
│   └── test.ts              # Test suite
├── README.md                # Main documentation
├── API.md                   # API reference
├── QUICKSTART.md           # Quick start guide
├── COMPARISON.md           # Comparison with Presidio
└── CHANGELOG.md            # Version history
```

## Areas for Contribution

### High Priority

1. **Additional Pattern Recognizers**
   - International phone numbers
   - IBAN/bank account numbers
   - Passport numbers
   - Driver's license numbers
   - Additional date/time formats

2. **Enhanced NER**
   - Support for additional languages
   - Custom NER model integration
   - Model optimization for browser

3. **Additional Operators**
   - Encryption operator
   - Format-preserving encryption
   - Synthetic data generation
   - Deterministic pseudonymization

### Medium Priority

4. **Structured Data Support**
   - CSV anonymization
   - JSON anonymization
   - Database query anonymization

5. **Performance Improvements**
   - Batch processing
   - Streaming support
   - Worker thread support

6. **Testing**
   - More comprehensive test coverage
   - Performance benchmarks
   - Browser compatibility tests

### Lower Priority

7. **Documentation**
   - More examples
   - Tutorial videos
   - Blog posts
   - Multi-language documentation

8. **Integrations**
   - Express.js middleware
   - Fastify plugin
   - React hooks
   - Vue composables

## Adding a New Pattern Recognizer

Example of adding a new pattern recognizer:

```typescript
// In src/patternRecognizer.ts

/**
 * Recognize IBAN bank account numbers
 */
static recognizeIBAN(text: string): RecognizerResult[] {
  // IBAN format: 2 letters, 2 digits, up to 30 alphanumeric
  const ibanPattern = /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g;
  return this.findMatches(text, ibanPattern, EntityType.IBAN, 0.85);
}

// Update recognizeAll method
static recognizeAll(text: string): RecognizerResult[] {
  return [
    ...this.recognizeEmail(text),
    ...this.recognizePhone(text),
    ...this.recognizeCreditCard(text),
    ...this.recognizeSSN(text),
    ...this.recognizeIPAddress(text),
    ...this.recognizeURL(text),
    ...this.recognizeIBAN(text), // Add new recognizer
  ];
}
```

Don't forget to add the entity type to `types.ts`:

```typescript
export enum EntityType {
  // ... existing types
  IBAN = 'IBAN',
}
```

## Adding a New Operator

Example of adding a new operator:

```typescript
// In src/types.ts
export enum OperatorType {
  // ... existing operators
  ENCRYPT = 'encrypt',
}

// In src/anonymizer.ts
private applyOperator(
  value: string,
  operator: OperatorConfig,
  entityType: EntityType
): string {
  switch (operator.type) {
    // ... existing cases
    case OperatorType.ENCRYPT:
      return this.encryptValue(value, operator.encryptionKey);
    // ...
  }
}

private encryptValue(value: string, key?: string): string {
  // Implementation
}
```

## Submitting Changes

1. **Commit your changes** with clear messages:
   ```bash
   git add .
   git commit -m "Add IBAN recognition pattern"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference to any related issues
   - Test results
   - Documentation updates (if applicable)

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if changing public APIs
- Add tests for new functionality
- Ensure all tests pass
- Update CHANGELOG.md
- Follow the existing code style

## Reporting Bugs

When reporting bugs, please include:

- AnonymizerTS version
- Node.js version
- Operating system
- Minimal code to reproduce
- Expected vs actual behavior
- Error messages/stack traces

## Feature Requests

For feature requests:

- Explain the use case
- Provide examples
- Suggest implementation approach (if applicable)
- Consider starting a discussion before implementation

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Assume good intentions

## Questions?

- Open an issue for questions
- Check existing documentation first
- Provide context when asking

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to AnonymizerTS! 🎉
