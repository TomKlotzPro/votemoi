import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete in order to respect foreign key constraints
    console.log('Cleaning database...');
    
    // First, delete sessions, votes, and comments as they depend on users and links
    await prisma.session.deleteMany();
    console.log('✓ Sessions deleted');
    
    await prisma.vote.deleteMany();
    console.log('✓ Votes deleted');
    
    await prisma.comment.deleteMany();
    console.log('✓ Comments deleted');
    
    // Then delete links
    await prisma.link.deleteMany();
    console.log('✓ Links deleted');
    
    // Finally delete users
    await prisma.user.deleteMany();
    console.log('✓ Users deleted');
    
    console.log('Database cleaned successfully!');
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
