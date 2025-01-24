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
      title: 'Next.js Documentation',
      description: 'Learn how to use Next.js',
      previewTitle: 'Next.js - The React Framework',
      previewDescription: 'Production grade React applications that scale. Next.js gives you the best developer experience with all the features you need for production.',
      previewImage: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/twitter-card.png',
      previewFavicon: 'https://nextjs.org/favicon.ico',
      previewSiteName: 'Next.js',
      createdById: user1.id,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      url: 'https://prisma.io',
      title: 'Prisma Documentation',
      description: 'Learn how to use Prisma',
      previewTitle: 'Prisma - Next-generation Node.js and TypeScript ORM',
      previewDescription: 'Prisma helps app developers build faster and make fewer errors with an open source database toolkit for PostgreSQL, MySQL, SQL Server, SQLite and MongoDB.',
      previewImage: 'https://website-v9.vercel.app/og-image.png',
      previewFavicon: 'https://prisma.io/favicon.ico',
      previewSiteName: 'Prisma',
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
      content: 'This is a great resource for learning Next.js!',
      userId: user2.id,
      linkId: link1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Prisma makes database work so much easier.',
      userId: user1.id,
      linkId: link2.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
