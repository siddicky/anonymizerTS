import { 
  AnalyzerEngine, 
  AnonymizerEngine, 
  EntityType, 
  OperatorType 
} from '../src';

/**
 * Basic example of PII detection and anonymization
 */
async function basicExample() {
  console.log('\n=== Basic Example ===\n');

  // Sample text with PII
  const text = `
    John Smith's email is john.smith@example.com and his phone number is 555-123-4567.
    He lives in New York and works at Microsoft Corporation.
    His credit card number is 4532-1488-0343-6467.
  `;

  console.log('Original text:', text);

  // Create analyzer
  const analyzer = new AnalyzerEngine({ 
    useNer: true  // Enable NER for better person/location/org detection
  });

  // Analyze text for PII
  console.log('\nAnalyzing text for PII...');
  const results = await analyzer.analyze(text);

  console.log('\nDetected entities:');
  results.forEach(result => {
    console.log(`- ${result.entityType}: "${result.text}" (score: ${result.score.toFixed(2)})`);
  });

  // Create anonymizer
  const anonymizer = new AnonymizerEngine();

  // Anonymize the text
  const anonymized = anonymizer.anonymize(text, results);

  console.log('\nAnonymized text:', anonymized.text);
  console.log('\nAnonymization details:');
  anonymized.items.forEach(item => {
    console.log(`- ${item.entityType} "${item.text}" → [${item.operator}]`);
  });
}

/**
 * Example with custom operators for different entity types
 */
async function customOperatorsExample() {
  console.log('\n=== Custom Operators Example ===\n');

  const text = `
    Contact: John Doe
    Email: john.doe@company.com
    Phone: 555-987-6543
    SSN: 123-45-6789
    Credit Card: 4532148803436467
  `;

  console.log('Original text:', text);

  // Create analyzer without NER for faster processing
  const analyzer = new AnalyzerEngine({ useNer: false });
  const results = await analyzer.analyze(text);

  // Create anonymizer with custom operators
  const anonymizer = new AnonymizerEngine();

  // Email: Replace with placeholder
  anonymizer.addOperatorForEntity(EntityType.EMAIL_ADDRESS, {
    type: OperatorType.REPLACE,
    newValue: '<EMAIL>'
  });

  // Phone: Mask last 4 digits
  anonymizer.addOperatorForEntity(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: 'X',
    charsToMask: 4,
    fromEnd: true
  });

  // SSN: Hash
  anonymizer.addOperatorForEntity(EntityType.US_SSN, {
    type: OperatorType.HASH,
    hashType: 'sha256'
  });

  // Credit Card: Mask all but last 4
  anonymizer.addOperatorForEntity(EntityType.CREDIT_CARD, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 12,
    fromEnd: false
  });

  const anonymized = anonymizer.anonymize(text, results);

  console.log('\nAnonymized text:', anonymized.text);
}

/**
 * Example with selective entity detection
 */
async function selectiveDetectionExample() {
  console.log('\n=== Selective Detection Example ===\n');

  const text = `
    User profile:
    Name: Jane Smith
    Email: jane@example.com
    Location: San Francisco, CA
    Company: Tech Corp
  `;

  console.log('Original text:', text);

  // Detect only specific entity types
  const analyzer = new AnalyzerEngine({ useNer: true });
  
  // Only detect emails and locations
  const results = await analyzer.analyze(text, [
    EntityType.EMAIL_ADDRESS,
    EntityType.LOCATION
  ]);

  console.log('\nDetected entities (EMAIL and LOCATION only):');
  results.forEach(result => {
    console.log(`- ${result.entityType}: "${result.text}"`);
  });

  const anonymizer = new AnonymizerEngine();
  const anonymized = anonymizer.anonymize(text, results);

  console.log('\nAnonymized text:', anonymized.text);
}

/**
 * Run all examples
 */
async function main() {
  try {
    await basicExample();
    await customOperatorsExample();
    await selectiveDetectionExample();
    
    console.log('\n=== All examples completed successfully! ===\n');
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { basicExample, customOperatorsExample, selectiveDetectionExample };
