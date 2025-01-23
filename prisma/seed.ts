const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.comment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.link.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      name: 'Demo User',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=demo',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Test User',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=test',
    },
  });

  // Create sample links
  const link1 = await prisma.link.create({
    data: {
      url: 'https://nextjs.org',
      title: 'Next.js - The React Framework',
      description: 'Production grade React applications that scale.',
      imageUrl: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/twitter-card.png',
      createdById: user1.id,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      url: 'https://prisma.io',
      title: 'Prisma - Next-generation Node.js and TypeScript ORM',
      description: 'Build data-driven JavaScript & TypeScript apps in less time.',
      imageUrl: 'https://website-v9.vercel.app/og-image.png',
      createdById: user2.id,
    },
  });

  // Create sample votes
  await prisma.vote.create({
    data: {
      userId: user1.id,
      linkId: link2.id,
    },
  });

  await prisma.vote.create({
    data: {
      userId: user2.id,
      linkId: link1.id,
    },
  });

  // Create sample comments
  await prisma.comment.create({
    data: {
      content: 'Great framework for building modern web apps!',
      userId: user2.id,
      linkId: link1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Love using Prisma in my projects!',
      userId: user1.id,
      linkId: link2.id,
    },
  });

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
