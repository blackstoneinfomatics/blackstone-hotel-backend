import { Module } from "@prisma/client";

export type ModuleWithParent = Module & {
  parent: Pick<Module, 'id' | 'name' | 'code'> | null;
};