const fs = require('fs');

const seedPath = 'prisma/seed.ts';
let seedCode = fs.readFileSync(seedPath, 'utf8');

// 1. Remove customer creation
seedCode = seedCode.replace(/const customer1 = await prisma\.user\.create\(\{[\s\S]*?\}\);\n\n/g, '');
seedCode = seedCode.replace(/const customer2 = await prisma\.user\.create\(\{[\s\S]*?\}\);\n\n/g, '');
seedCode = seedCode.replace(/const customer3 = await prisma\.user\.create\(\{[\s\S]*?\}\);\n\n/g, '');

// 2. Remove sample orders section completely
// Find where sample orders starts
const sampleOrdersStart = seedCode.indexOf('// ─── Sample Orders ────────────────────────────────────────');
if (sampleOrdersStart !== -1) {
  // Find where the end of the file/database seeded message is
  const endMarker = seedCode.indexOf('console.log(\'\\n✅ Database seeded successfully!\\n\');');
  
  if (endMarker !== -1) {
    seedCode = seedCode.substring(0, sampleOrdersStart) + seedCode.substring(endMarker);
  }
}

// 3. Update the credentials log at the bottom to remove customers
seedCode = seedCode.replace(/console\.log\('Customer:  rahul@campus\.edu \/ password123'\);\n/g, '');
seedCode = seedCode.replace(/console\.log\('Customer:  sahil@campus\.edu \/ password123'\);\n/g, '');
seedCode = seedCode.replace(/console\.log\('Customer:  priya@campus\.edu \/ password123'\);\n/g, '');

fs.writeFileSync(seedPath, seedCode);
console.log('Seed file cleaned!');
