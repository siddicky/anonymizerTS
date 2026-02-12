/**
 * Simple usage example using the built package
 * Run with: node examples/simple.js
 */

const { AnalyzerEngine, AnonymizerEngine, EntityType, OperatorType } = require('../dist');

async function main() {
  console.log('🔍 Simple AnonymizerTS Example\n');

  // Create analyzer (pattern-based only for speed)
  const analyzer = new AnalyzerEngine({ useNer: false });

  // Text with PII
  const text = 'My email is alice@example.com and my phone is 555-0199';
  console.log('Original:', text);

  // Detect PII
  const results = await analyzer.analyze(text);
  console.log('\nDetected:', results.map(r => `${r.entityType}: ${r.text}`).join(', '));

  // Anonymize
  const anonymizer = new AnonymizerEngine();
  const anonymized = anonymizer.anonymize(text, results);
  console.log('Anonymized:', anonymized.text);
}

main().catch(console.error);
