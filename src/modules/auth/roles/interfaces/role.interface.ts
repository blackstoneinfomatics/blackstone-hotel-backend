export interface IRole {
  id: string;
  name: string;
  code: string;
  description?: string;

  isSystem: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt:Date;

  createdAt: Date;
  updatedAt: Date;
}