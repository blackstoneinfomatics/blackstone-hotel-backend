// permission.types.ts

import { Prisma } from '@prisma/client';

export const permissionInclude =
  Prisma.validator<Prisma.PermissionInclude>()({
    module: {
      select: {
        id: true,
        name: true,
        code: true,
        moduleScope: true,
      },
    },
  });

export type PermissionWithModule =
  Prisma.PermissionGetPayload<{
    include: typeof permissionInclude;
  }>;