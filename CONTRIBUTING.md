# Contributing to AnonymizerTS

Thank you for your interest in contributing to AnonymizerTS! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siddicky/anonymizerTS.git
   cd anonymizerTS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run examples:**
   ```bash
   npm run demo
   npm run test:quick
   ```

## Project Structure

```
anonymizerTS/
├── src/
│   ├── analyzer/          # PII detection engine
│   │   └── AnalyzerEngine.ts
│   ├── anonymizer/        # De-identification engine
│   │   ├── AnonymizerEngine.ts
│   │   └── Operators.ts
│   ├── recognizers/       # Entity recognizers
│   │   ├── PatternRecognizer.ts
│   │   └── NerRecognizer.ts
│   ├── types/            # TypeScript types and interfaces
│   │   └── index.ts
│   └── index.ts          # Main exports
├── examples/             # Usage examples
├── dist/                 # Compiled JavaScript (generated)
└── tsconfig.json         # TypeScript configuration
```

## Adding New Features

### Adding a New Entity Type

1. Add the entity type to `EntityType` enum in `src/types/index.ts`:
   ```typescript
   export enum EntityType {
     // ... existing types
     MY_NEW_TYPE = 'MY_NEW_TYPE'
   }
   ```

2. Add detection logic in `PatternRecognizer.ts` or create a custom recognizer:
   ```typescript
   this.patterns.set(EntityType.MY_NEW_TYPE, [
     /your-regex-pattern/g
   ]);
   ```

### Adding a New Anonymization Operator

1. Create a new operator class in `src/anonymizer/Operators.ts`:
   ```typescript
   export class MyOperator implements Operator {
     operate(text: string, start: number, end: number): string {
       // Your implementation
     }
   }
   ```

2. Add to `OperatorType` enum and update `OperatorFactory`.

### Adding a New Recognizer

1. Implement the `EntityRecognizer` interface:
   ```typescript
   export class MyRecognizer implements EntityRecognizer {
     supportedEntities = [EntityType.MY_TYPE];
     
     async analyze(text: string): Promise<RecognizerResult[]> {
       // Your detection logic
     }
   }
   ```

2. Users can add it via:
   ```typescript
   analyzer.addRecognizer(new MyRecognizer());
   ```

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

## Testing

Currently, the project uses example-based testing. To test your changes:

```bash
npm run build
npm run demo
npm run test:quick
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Build and test: `npm run build && npm run demo`
5. Commit your changes with clear messages
6. Push to your fork
7. Create a Pull Request

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Questions?

Open an issue on GitHub if you have questions or need help!
