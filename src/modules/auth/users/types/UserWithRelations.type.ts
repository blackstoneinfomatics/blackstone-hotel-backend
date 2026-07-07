// user.types.ts

import { Prisma } from "@prisma/client";

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  authProviders: {
    where: {
      deletedAt: null,
    },
  },
  userRoles: {
    where: {
      isActive: true,
      revokedAt: null,
      deletedAt: null,
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

export type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;