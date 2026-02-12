import { 
  AnalyzerEngine, 
  AnonymizerEngine, 
  EntityType, 
  OperatorType 
} from '../src';

/**
 * Test credit card detection
 */
async function testCreditCard() {
  console.log('\n=== Credit Card Test ===\n');

  // Test with valid credit card numbers (test cards)
  const text = `
    Test cards:
    Visa: 4532015112830366
    MasterCard: 5425233430109903
    Invalid: 1234-5678-9012-3456
  `;

  console.log('Original text:', text);

  const analyzer = new AnalyzerEngine({ useNer: false });
  const results = await analyzer.analyze(text);

  console.log('\nDetected entities:');
  results.forEach(result => {
    console.log(`- ${result.entityType}: "${result.text}" (score: ${result.score.toFixed(2)})`);
  });

  const anonymizer = new AnonymizerEngine();
  anonymizer.addOperatorForEntity(EntityType.CREDIT_CARD, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 12,
    fromEnd: false
  });

  const anonymized = anonymizer.anonymize(text, results);
  console.log('\nAnonymized text:', anonymized.text);
}

testCreditCard().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
