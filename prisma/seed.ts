
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create initial Games
    const rov = await prisma.game.upsert({
        where: { slug: 'rov' },
        update: {},
        create: {
            name: 'RoV: Arena of Valor',
            slug: 'rov',
            image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
            active: true,
            packages: {
                create: [
                    { name: '15 Coupons', price: 10, currency: 'THB', active: true },
                    { name: '45 Coupons', price: 30, currency: 'THB', active: true },
                    { name: '75 Coupons', price: 50, currency: 'THB', active: true },
                    { name: '150 Coupons', price: 100, currency: 'THB', active: true },
                    { name: '300 Coupons', price: 200, currency: 'THB', active: true },
                    { name: '750 Coupons', price: 500, currency: 'THB', active: true },
                ]
            }
        },
    });

    const valo = await prisma.game.upsert({
        where: { slug: 'valorant' },
        update: {},
        create: {
            name: 'Valorant',
            slug: 'valorant',
            image_url: 'https://images.unsplash.com/photo-1624138784181-dc7f5b75e52e?w=800&auto=format&fit=crop&q=60',
            active: true,
            packages: {
                create: [
                    { name: '125 VP', price: 35, currency: 'THB', active: true },
                    { name: '380 VP', price: 100, currency: 'THB', active: true },
                    { name: '790 VP', price: 200, currency: 'THB', active: true },
                    { name: '1650 VP', price: 400, currency: 'THB', active: true },
                    { name: '2850 VP', price: 700, currency: 'THB', active: true },
                ]
            }
        }
    });

    const freefire = await prisma.game.upsert({
        where: { slug: 'free-fire' },
        update: {},
        create: {
            name: 'Free Fire',
            slug: 'free-fire',
            image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&auto=format&fit=crop&q=60',
            active: true,
            packages: {
                create: [
                    { name: '100 Diamonds', price: 30, currency: 'THB', active: true },
                    { name: '310 Diamonds', price: 100, currency: 'THB', active: true },
                    { name: '520 Diamonds', price: 150, currency: 'THB', active: true },
                    { name: '1060 Diamonds', price: 300, currency: 'THB', active: true },
                ]
            }
        }
    });

    console.log({ rov, valo, freefire });
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
