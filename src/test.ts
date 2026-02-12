import {
  PresidioAnalyzer,
  PresidioAnonymizer,
  PatternRecognizer,
  EntityType,
  OperatorType,
} from './index.js';

/**
 * Simple test suite for AnonymizerTS
 * Run with: npm run build && node dist/test.js
 */

let testsPassed = 0;
let testsFailed = 0;

function assertEqual<T>(actual: T, expected: T, testName: string) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`✗ ${testName}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

function assertTrue(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`✗ ${testName}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running AnonymizerTS Tests...\n');

  // Test 1: Email Recognition
  console.log('--- Pattern Recognition Tests ---');
  const emailText = 'Contact us at test@example.com or support@company.org';
  const emailResults = PatternRecognizer.recognizeEmail(emailText);
  assertEqual(emailResults.length, 2, 'Should detect 2 emails');
  assertEqual(emailResults[0].entityType, EntityType.EMAIL_ADDRESS, 'Should detect EMAIL_ADDRESS type');
  assertEqual(emailResults[0].text, 'test@example.com', 'Should detect correct email');

  // Test 2: Phone Recognition
  const phoneText = 'Call (555) 123-4567 or 1-800-555-0199';
  const phoneResults = PatternRecognizer.recognizePhone(phoneText);
  assertEqual(phoneResults.length, 2, 'Should detect 2 phone numbers');

  // Test 3: SSN Recognition
  const ssnText = 'SSN: 123-45-6789';
  const ssnResults = PatternRecognizer.recognizeSSN(ssnText);
  assertEqual(ssnResults.length, 1, 'Should detect 1 SSN');
  assertEqual(ssnResults[0].text, '123-45-6789', 'Should detect correct SSN');

  // Test 4: Credit Card Recognition
  const ccText = 'Card: 4532-1234-5678-9010';
  const ccResults = PatternRecognizer.recognizeCreditCard(ccText);
  assertEqual(ccResults.length, 1, 'Should detect 1 credit card');

  // Test 5: URL Recognition
  const urlText = 'Visit https://example.com or http://test.org';
  const urlResults = PatternRecognizer.recognizeURL(urlText);
  assertEqual(urlResults.length, 2, 'Should detect 2 URLs');

  // Test 6: IP Address Recognition
  const ipText = 'Server at 192.168.1.1 and 10.0.0.1';
  const ipResults = PatternRecognizer.recognizeIPAddress(ipText);
  assertEqual(ipResults.length, 2, 'Should detect 2 IP addresses');

  // Test 7: Analyzer (pattern-only)
  console.log('\n--- Analyzer Tests ---');
  const analyzer = new PresidioAnalyzer({ useNER: false });
  const mixedText = 'Contact john@email.com or call (555) 123-4567. SSN: 123-45-6789';
  const analyzerResults = await analyzer.analyze(mixedText);
  assertTrue(analyzerResults.length >= 3, 'Should detect at least 3 entities');

  // Test 8: Entity Type Filtering
  const filteredResults = await analyzer.analyze(mixedText, [EntityType.EMAIL_ADDRESS]);
  assertEqual(filteredResults.length, 1, 'Should filter to only EMAIL_ADDRESS');
  assertEqual(filteredResults[0].entityType, EntityType.EMAIL_ADDRESS, 'Should be EMAIL_ADDRESS type');

  // Test 9: Redact Operator
  console.log('\n--- Anonymizer Tests ---');
  const anonymizer = new PresidioAnonymizer({ type: OperatorType.REDACT });
  const simpleText = 'Email: test@example.com';
  const simpleResults = PatternRecognizer.recognizeEmail(simpleText);
  const redacted = anonymizer.anonymize(simpleText, simpleResults);
  assertEqual(redacted.text, 'Email: <EMAIL_ADDRESS>', 'Should redact email');

  // Test 10: Replace Operator
  const replaceOperators = new Map();
  replaceOperators.set(EntityType.EMAIL_ADDRESS, {
    type: OperatorType.REPLACE,
    newValue: '[REDACTED]',
  });
  const replaced = anonymizer.anonymize(simpleText, simpleResults, replaceOperators);
  assertEqual(replaced.text, 'Email: [REDACTED]', 'Should replace email with custom value');

  // Test 11: Mask Operator
  const maskText = 'SSN: 123-45-6789';
  const maskResults = PatternRecognizer.recognizeSSN(maskText);
  const maskOperators = new Map();
  maskOperators.set(EntityType.US_SSN, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 7,
    fromEnd: true,
  });
  const masked = anonymizer.anonymize(maskText, maskResults, maskOperators);
  assertTrue(masked.text.includes('***'), 'Should mask SSN');

  // Test 12: Hash Operator
  const hashOperators = new Map();
  hashOperators.set(EntityType.US_SSN, {
    type: OperatorType.HASH,
  });
  const hashed = anonymizer.anonymize(maskText, maskResults, hashOperators);
  assertTrue(hashed.text !== maskText, 'Should hash SSN');
  assertTrue(hashed.text.length > 10, 'Hashed value should exist');

  // Test 13: Multiple Entities
  const multiText = 'Email: test@example.com, Phone: (555) 123-4567';
  const multiResults = PatternRecognizer.recognizeAll(multiText);
  const multiAnonymized = anonymizer.anonymize(multiText, multiResults);
  assertEqual(
    multiAnonymized.text,
    'Email: <EMAIL_ADDRESS>, Phone: <PHONE_NUMBER>',
    'Should anonymize multiple entities'
  );

  // Test 14: Overlapping Entities
  console.log('\n--- Edge Cases ---');
  const overlapText = 'test@example.com';
  const allResults = PatternRecognizer.recognizeAll(overlapText);
  // After overlap removal, should only have email (not URL)
  const dedupedResults = await analyzer.analyze(overlapText);
  assertTrue(dedupedResults.length >= 1, 'Should handle overlapping entities');

  // Test 15: Empty Text
  const emptyResults = await analyzer.analyze('');
  assertEqual(emptyResults.length, 0, 'Should handle empty text');

  // Test 16: No Entities
  const noEntityText = 'This is just regular text without any PII.';
  const noEntityResults = await analyzer.analyze(noEntityText);
  assertEqual(noEntityResults.length, 0, 'Should return empty array for text without PII');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log('='.repeat(60));

  if (testsFailed === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
  } else {
    console.error('✗ Some tests failed!');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
