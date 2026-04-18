import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'default-org' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default-org',
    },
  });

  console.log('Created organization:', organization.name);

  // Create admin user (SystemRole: ADMIN)
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create test users (SystemRole: MEMBER)
  const testUsers = [
    { email: 'sm@example.com', name: 'スクラムマスター 佐藤' },
    { email: 'po@example.com', name: 'プロダクトオーナー 鈴木' },
    { email: 'dev1@example.com', name: '開発者 田中' },
    { email: 'dev2@example.com', name: '開発者 山田' },
    { email: 'dev3@example.com', name: '開発者 伊藤' },
  ];

  for (const tu of testUsers) {
    const hash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: tu.email },
      update: {},
      create: {
        email: tu.email,
        passwordHash: hash,
        name: tu.name,
        role: 'MEMBER',
        organizationId: organization.id,
      },
    });
    console.log('Created test user:', user.email);
  }

  // Create default team
  const team = await prisma.team.upsert({
    where: {
      id: 'default-team-id',
    },
    update: {},
    create: {
      id: 'default-team-id',
      name: 'Development Team',
      organizationId: organization.id,
      ticketPrefix: 'SCR',
      velocityMode: 'STORY_POINTS',
    },
  });

  console.log('Created team:', team.name);

  // Add admin as team owner
  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: adminUser.id,
      role: 'DEVELOPER',
      isOwner: true,
    },
  });

  console.log('Added admin to team as owner');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
