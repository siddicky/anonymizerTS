import { 
  AnalyzerEngine, 
  AnonymizerEngine, 
  EntityType, 
  OperatorType 
} from '../src';

/**
 * Quick test without NER (pattern-based only)
 */
async function quickTest() {
  console.log('\n=== Quick Test (Pattern-based only) ===\n');

  // Sample text with PII
  const text = `
    Contact Information:
    Email: john.smith@example.com
    Phone: 555-123-4567
    Credit Card: 4532-1488-0343-6467
    SSN: 123-45-6789
    Website: https://example.com
    IP: 192.168.1.1
  `;

  console.log('Original text:', text);

  // Create analyzer without NER for faster testing
  const analyzer = new AnalyzerEngine({ useNer: false });

  // Analyze text for PII
  console.log('\nAnalyzing text for PII (pattern-based)...');
  const results = await analyzer.analyze(text);

  console.log('\nDetected entities:');
  results.forEach(result => {
    console.log(`- ${result.entityType}: "${result.text}" (score: ${result.score.toFixed(2)}, pos: ${result.start}-${result.end})`);
  });

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

  // Credit Card: Mask all but last 4
  anonymizer.addOperatorForEntity(EntityType.CREDIT_CARD, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 15,
    fromEnd: false
  });

  // SSN: Hash
  anonymizer.addOperatorForEntity(EntityType.US_SSN, {
    type: OperatorType.HASH,
    hashType: 'sha256'
  });

  // Anonymize the text
  const anonymized = anonymizer.anonymize(text, results);

  console.log('\nAnonymized text:', anonymized.text);
  console.log('\nAnonymization details:');
  anonymized.items.forEach(item => {
    console.log(`- ${item.entityType}: "${item.text}" → [${item.operator}]`);
  });

  console.log('\n✅ Quick test completed successfully!\n');
}

// Run test
quickTest().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
