import {
  PresidioAnalyzer,
  PresidioAnonymizer,
  EntityType,
  OperatorType,
} from './index.js';

async function main() {
  console.log('=== AnonymizerTS Example ===\n');

  // Sample text with various PII
  const text = `
John Smith lives in New York and works at Microsoft Corporation.
His email is john.smith@email.com and phone number is (555) 123-4567.
His SSN is 123-45-6789 and credit card is 4532-1234-5678-9010.
He can be reached at https://johnsmith.com or IP address 192.168.1.1.
Jane Doe from Los Angeles works at Google and her email is jane@example.org.
  `.trim();

  console.log('Original text:');
  console.log(text);
  console.log('\n' + '='.repeat(80) + '\n');

  // Initialize analyzer
  console.log('Initializing analyzer...');
  const analyzer = new PresidioAnalyzer({ useNER: true });
  await analyzer.initialize();
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

  // Example 3: Replace with custom values
  console.log('Example 3: Replace names and locations');
  const replaceOperators = new Map();
  replaceOperators.set(EntityType.PERSON, {
    type: OperatorType.REPLACE,
    newValue: '[REDACTED NAME]',
  });
  replaceOperators.set(EntityType.LOCATION, {
    type: OperatorType.REPLACE,
    newValue: '[REDACTED LOCATION]',
  });
  replaceOperators.set(EntityType.ORGANIZATION, {
    type: OperatorType.REPLACE,
    newValue: '[REDACTED ORG]',
  });

  const replacedResult = anonymizer.anonymize(text, analyzerResults, replaceOperators);
  console.log(replacedResult.text);
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('Example complete!');
}

main().catch(console.error);
