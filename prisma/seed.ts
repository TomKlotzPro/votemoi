import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up existing data
    await prisma.session.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.link.deleteMany();
    await prisma.user.deleteMany();

    // Create sample users with sessions
    const user1 = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: 'Chloé',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chloe',
        },
      });

      await tx.session.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return user;
    });

    const user2 = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: 'Tom',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tom',
        },
      });

      await tx.session.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return user;
    });

    // Create sample links
    const link1 = await prisma.link.create({
      data: {
        url: 'https://www.booking.com/hotel/fr/domaine-de-la-falaise.fr.html?aid=898224&app_hotel_id=9578639&checkin=2025-05-29&checkout=2025-06-01&from_sn=ios&group_adults=10&group_children=0&label=hotel_details-3n5HQl3%401737637885&no_rooms=1&req_adults=10&req_children=0&room1=A%2CA%2CA%2CA%2CA%2CA%2CA%2CA%2CA%2CA%2C',
        title: 'Domaine de la Falaise, Saint-Hélen, France',
        description:
          'Situé à Saint-Hélen, le Domaine de la Falaise propose une piscine chauffée. Un parking privé est disponible gratuitement sur place.',
        previewTitle: 'Domaine de la Falaise - Booking.com',
        previewDescription:
          "Découvrez le Domaine de la Falaise à Saint-Hélen. Profitez d'une piscine chauffée et d'un parking privé gratuit.",
        previewImage:
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop',
        previewFavicon: 'https://www.booking.com/favicon.ico',
        previewSiteName: 'Booking.com',
        createdById: user1.id,
      },
    });

    // Create sample votes
    await prisma.vote.create({
      data: {
        userId: user2.id,
        linkId: link1.id,
      },
    });

    // Create sample comments
    await prisma.comment.create({
      data: {
        content: 'Parfait pour un séjour en famille ou entre amis !',
        userId: user2.id,
        linkId: link1.id,
      },
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
/* eslint-enable @typescript-eslint/no-require-imports */
