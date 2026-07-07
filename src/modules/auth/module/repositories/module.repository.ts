import { PrismaService } from "@/infrastructure/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateModuleDto } from "../dto/CreateModule.dto";
import { ModuleScope } from "@prisma/client";
import { Prisma ,Status} from "@prisma/client";
import { UpdateModuleDto } from "../dto/UpdateModule.dto";

@Injectable()
export class ModuleRepository {
  constructor(private readonly prisma: PrismaService) {
  }
  
  async create(dto: CreateModuleDto) {
    return this.prisma.module.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        route: dto.route,
        icon: dto.icon,
        displayOrder: dto.displayOrder ?? 0,
        parentId: dto.parentId,
        moduleScope: dto.moduleScope ?? ModuleScope.BOTH,
        isVisible: dto.isVisible ?? true,
        isSystem: dto.isSystem ?? false,
        status: dto.status ?? Status.ACTIVE,
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.module.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.module.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  async findById(id: string) {
  return this.prisma.module.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
}

  async findMany(
  where: Prisma.ModuleWhereInput,
  skip: number,
  take: number,
) {
  return this.prisma.module.findMany({
    where,
    skip,
    take,
    orderBy: [
      {
        displayOrder: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
}

async count(where: Prisma.ModuleWhereInput) {
  return this.prisma.module.count({
    where,
  });
}

async update(
  id: string,
  dto: UpdateModuleDto,
) {
  return this.prisma.module.update({
    where: {
      id,
    },
    data: {
      name: dto.name,
      description: dto.description,
      route: dto.route,
      icon: dto.icon,
      displayOrder: dto.displayOrder,
      parentId: dto.parentId,
      isVisible: dto.isVisible,
      status: dto.status,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
}

async countChildren(parentId :string) {
  return this.prisma.module.count({
    where:{
      parentId,
      deletedAt :null
    }
  })
}

async softDelete(id: string): Promise<void> {
  await this.prisma.module.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}
async updateStatus(
  id: string,
  status: Status,
) {
  return this.prisma.module.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
}
async findTree(moduleScope?: ModuleScope) {
  const where: Prisma.ModuleWhereInput = {
    deletedAt: null,
    status: Status.ACTIVE,
    isVisible: true,
  };

  switch (moduleScope) {
    case ModuleScope.SUPER_ADMIN:
      where.moduleScope = {
        in: [
          ModuleScope.SUPER_ADMIN,
          ModuleScope.BOTH,
        ],
      };
      break;

    case ModuleScope.TENANT:
      where.moduleScope = {
        in: [
          ModuleScope.TENANT,
          ModuleScope.BOTH,
        ],
      };
      break;

    case ModuleScope.BOTH:
      where.moduleScope = ModuleScope.BOTH;
      break;

    default:
      // Return all modules
      break;
  }

  return this.prisma.module.findMany({
    where,
    orderBy: [
      {
        displayOrder: 'asc',
      },
      {
        name: 'asc',
      },
    ],
  });
}

}