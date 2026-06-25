import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Super Admin...');

  const email = 'superadmin@zotel.ai';
  const password = 'Admin@123';

  // Check Role
  const superAdminRole = await prisma.role.findFirst({
    where: {
      code: 'SUPER_ADMIN',
      deletedAt: null,
    },
  });

  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not found');
  }

  // Check Existing User
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });

  if (existingUser) {
    console.log('✅ Super Admin already exists');
    return;
  }

 const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
});

  await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        displayName: 'Super Admin',

        email,

        status: 'ACTIVE',

        isEmailVerified: true,
        isPhoneVerified: false,
      },
    });

    // Create Auth Provider
    await tx.authProvider.create({
      data: {
        userId: user.id,

        provider: 'EMAIL_PASSWORD',

        passwordHash,

        isPrimary: true,
      },
    });

    // Assign Role
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,

        isActive: true,

        assignedAt: new Date(),
      },
    });

    console.log('✅ Super Admin User Created');
  });

  console.log('🎉 Seed Completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });