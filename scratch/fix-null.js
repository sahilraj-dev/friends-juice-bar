const fs = require('fs');

const files = [
  'src/app/api/cart/route.ts',
  'src/app/api/favorites/route.ts',
  'src/app/api/notifications/read-all/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/orders/[id]/review/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/support/tickets/route.ts'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    /const user = await prisma\.user\.findUnique\(\{ where: \{ email: session\.user\.email \} \}\);\n\s*(?!if \(\!user\))/g,
    "const user = await prisma.user.findUnique({ where: { email: session.user.email } });\n    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });\n    "
  );
  fs.writeFileSync(f, content);
}
console.log('Fixed missing user null checks!');
