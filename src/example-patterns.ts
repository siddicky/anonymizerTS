import {
  PresidioAnalyzer,
  PresidioAnonymizer,
  EntityType,
  OperatorType,
} from './index.js';

async function main() {
  console.log('=== AnonymizerTS Pattern-Based Example ===\n');

  // Sample text with various PII
  const text = `
John Smith lives in New York and works at Microsoft Corporation.
His email is john.smith@email.com and phone number is (555) 123-4567.
His SSN is 123-45-6789 and credit card is 4532-1234-5678-9010.
He can be reached at https://johnsmith.com or IP address 192.168.1.1.
Contact support at support@company.org or call 1-800-555-0199.
  `.trim();

  console.log('Original text:');
  console.log(text);
  console.log('\n' + '='.repeat(80) + '\n');

  // Initialize analyzer WITHOUT NER (pattern-based only)
  console.log('Initializing analyzer (pattern-based recognition only)...');
  const analyzer = new PresidioAnalyzer({ useNER: false });
  console.log('Analyzer initialized.\n');

  // Analyze text
  console.log('Analyzing text for PII...');
  const analyzerResults = await analyzer.analyze(text);
  
  console.log(`\nFound ${analyzerResults.length} PII entities:`);
  for (const result of analyzerResults) {
    console.log(
      `  - ${result.entityType}: "${result.text}" (score: ${result.score.toFixed(2)})`
    );
  }
  console.log('\n' + '='.repeat(80) + '\n');

  // Example 1: Redact all entities
  console.log('Example 1: Redact all entities');
  const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
  const redactedResult = anonymizer.anonymize(text, analyzerResults);
  console.log(redactedResult.text);
  console.log('\n' + '='.repeat(80) + '\n');

  // Example 2: Mask sensitive data
  console.log('Example 2: Mask phone numbers and credit cards');
  const operators = new Map();
  operators.set(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 7,
    fromEnd: true,
  });
  operators.set(EntityType.CREDIT_CARD, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 12,
  });
  operators.set(EntityType.EMAIL_ADDRESS, {
    type: OperatorType.REPLACE,
    newValue: '<EMAIL>',
  });
  operators.set(EntityType.US_SSN, {
    type: OperatorType.HASH,
  });

  const maskedResult = anonymizer.anonymize(text, analyzerResults, operators);
  console.log(maskedResult.text);
  console.log('\n' + '='.repeat(80) + '\n');

  // Example 3: Specific entity filtering
  console.log('Example 3: Only anonymize emails and phone numbers');
  const filteredResults = analyzerResults.filter(r => 
    r.entityType === EntityType.EMAIL_ADDRESS || 
    r.entityType === EntityType.PHONE_NUMBER
  );
  
  const selectiveResult = anonymizer.anonymize(text, filteredResults);
  console.log(selectiveResult.text);
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('✓ Example complete!');
  console.log('\nNote: This example uses pattern-based recognition only.');
  console.log('For NER-based recognition (detecting names, locations, organizations),');
  console.log('set useNER: true when creating the analyzer. This requires internet');
  console.log('connection to download the transformer model on first run.');
}

main().catch(console.error);
