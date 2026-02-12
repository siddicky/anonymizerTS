import { 
  AnalyzerEngine, 
  AnonymizerEngine, 
  EntityType, 
  OperatorType 
} from '../src';

/**
 * Comprehensive demo showcasing all features
 */
async function comprehensiveDemo() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         AnonymizerTS - PII Detection & Anonymization          ║');
  console.log('║     TypeScript Implementation of Microsoft Presidio           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Pattern-based detection
  console.log('📋 Test 1: Pattern-based PII Detection\n');
  
  const patternText = `
Dear Customer,

Your order details:
- Email: support@company.com
- Phone: +1-555-789-0123
- Payment: Card ending in 5425233430109903
- Account: IBAN GB82 WEST 1234 5698 7654 32
- IP Address: 203.0.113.42

For support, visit https://support.company.com
`;

  console.log('Original text:', patternText);

  const analyzer = new AnalyzerEngine({ useNer: false });
  const results = await analyzer.analyze(patternText);

  console.log('\n✓ Detected PII:');
  results.forEach(result => {
    console.log(`  • ${result.entityType.padEnd(20)} "${result.text}" (confidence: ${(result.score * 100).toFixed(0)}%)`);
  });

  const anonymizer = new AnonymizerEngine();
  
  // Configure different operators for different entity types
  anonymizer.addOperatorForEntity(EntityType.EMAIL_ADDRESS, {
    type: OperatorType.REPLACE,
    newValue: '[EMAIL REDACTED]'
  });
  
  anonymizer.addOperatorForEntity(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: 'X',
    charsToMask: 6,
    fromEnd: true
  });
  
  anonymizer.addOperatorForEntity(EntityType.CREDIT_CARD, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 12,
    fromEnd: false
  });

  anonymizer.addOperatorForEntity(EntityType.IBAN_CODE, {
    type: OperatorType.REPLACE,
    newValue: '[IBAN REDACTED]'
  });

  anonymizer.addOperatorForEntity(EntityType.IP_ADDRESS, {
    type: OperatorType.HASH,
    hashType: 'md5'
  });

  anonymizer.addOperatorForEntity(EntityType.URL, {
    type: OperatorType.REPLACE,
    newValue: '[URL REDACTED]'
  });

  const anonymized = anonymizer.anonymize(patternText, results);
  
  console.log('\n✓ Anonymized text:', anonymized.text);

  // Test 2: Selective detection
  console.log('\n\n📋 Test 2: Selective Entity Detection\n');
  
  const selectiveText = 'Contact John at john@example.com or jane@example.org. Phone: 555-0100';
  console.log('Original:', selectiveText);
  
  // Only detect emails
  const emailResults = await analyzer.analyze(selectiveText, [EntityType.EMAIL_ADDRESS]);
  console.log('\n✓ Detected (EMAIL only):', emailResults.map(r => r.text).join(', '));
  
  const emailAnonymized = anonymizer.anonymize(selectiveText, emailResults);
  console.log('✓ Anonymized:', emailAnonymized.text);

  // Test 3: Different masking strategies
  console.log('\n\n📋 Test 3: Different Masking Strategies\n');
  
  const phone = '555-123-4567';
  console.log('Original phone:', phone);
  
  // Mask from beginning
  const maskBegin = new AnonymizerEngine();
  maskBegin.addOperatorForEntity(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: '#',
    charsToMask: 7,
    fromEnd: false
  });
  
  const phoneResults = await analyzer.analyze(phone);
  const masked1 = maskBegin.anonymize(phone, phoneResults);
  console.log('✓ Mask first 7 chars:', masked1.text);
  
  // Mask from end
  const maskEnd = new AnonymizerEngine();
  maskEnd.addOperatorForEntity(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: '*',
    charsToMask: 4,
    fromEnd: true
  });
  
  const masked2 = maskEnd.anonymize(phone, phoneResults);
  console.log('✓ Mask last 4 chars:', masked2.text);
  
  // Mask all
  const maskAll = new AnonymizerEngine();
  maskAll.addOperatorForEntity(EntityType.PHONE_NUMBER, {
    type: OperatorType.MASK,
    maskingChar: 'X',
    charsToMask: -1
  });
  
  const masked3 = maskAll.anonymize(phone, phoneResults);
  console.log('✓ Mask all chars:', masked3.text);

  // Test 4: Hash vs Encrypt
  console.log('\n\n📋 Test 4: Hash vs Encrypt Comparison\n');
  
  const ssn = '123-45-6789';
  console.log('Original SSN:', ssn);
  
  const ssnResults = await analyzer.analyze(ssn);
  
  const hasher = new AnonymizerEngine();
  hasher.addOperatorForEntity(EntityType.US_SSN, {
    type: OperatorType.HASH,
    hashType: 'sha256'
  });
  const hashed = hasher.anonymize(ssn, ssnResults);
  console.log('✓ SHA-256 Hash:', hashed.text.substring(0, 50) + '...');
  
  const encryptor = new AnonymizerEngine();
  encryptor.addOperatorForEntity(EntityType.US_SSN, {
    type: OperatorType.ENCRYPT,
    newValue: 'secret-key-123'
  });
  const encrypted = encryptor.anonymize(ssn, ssnResults);
  console.log('✓ Encrypted:', encrypted.text);

  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ All tests completed!                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Summary
  console.log('📊 Summary:\n');
  console.log('  Supported Pattern-based Entities:');
  console.log('    • EMAIL_ADDRESS, PHONE_NUMBER, CREDIT_CARD');
  console.log('    • IP_ADDRESS, URL, US_SSN, IBAN_CODE\n');
  
  console.log('  Supported Anonymization Operators:');
  console.log('    • REPLACE - Replace with custom text');
  console.log('    • MASK - Mask characters (configurable)');
  console.log('    • HASH - Hash with MD5/SHA-256/SHA-512');
  console.log('    • ENCRYPT - Simple encryption');
  console.log('    • REDACT - Complete removal\n');
  
  console.log('  For NER-based detection (PERSON, LOCATION, ORG):');
  console.log('    Use: new AnalyzerEngine({ useNer: true })\n');
}

// Run demo
comprehensiveDemo().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
