import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants.map(t => ({ slug: t.slug, name: t.name })));
  
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ email: u.email, id: u.id })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
