
// const permissions = [
//   // AUTH
//   { code: 'auth.login', module: 'AUTH', action: 'LOGIN', name: 'Login' },
//   { code: 'auth.logout', module: 'AUTH', action: 'LOGOUT', name: 'Logout' },
//   { code: 'auth.refresh_token', module: 'AUTH', action: 'REFRESH_TOKEN', name: 'Refresh Token' },
//   { code: 'auth.change_password', module: 'AUTH', action: 'CHANGE_PASSWORD', name: 'Change Password' },

//   // TENANT
//   { code: 'tenant.create', module: 'TENANT', action: 'CREATE', name: 'Create Tenant' },
//   { code: 'tenant.view', module: 'TENANT', action: 'VIEW', name: 'View Tenant' },
//   { code: 'tenant.update', module: 'TENANT', action: 'UPDATE', name: 'Update Tenant' },
//   { code: 'tenant.delete', module: 'TENANT', action: 'DELETE', name: 'Delete Tenant' },
//   { code: 'tenant.list', module: 'TENANT', action: 'LIST', name: 'List Tenants' },

//   // PROPERTY
//   { code: 'property.create', module: 'PROPERTY', action: 'CREATE', name: 'Create Property' },
//   { code: 'property.view', module: 'PROPERTY', action: 'VIEW', name: 'View Property' },
//   { code: 'property.update', module: 'PROPERTY', action: 'UPDATE', name: 'Update Property' },
//   { code: 'property.delete', module: 'PROPERTY', action: 'DELETE', name: 'Delete Property' },
//   { code: 'property.list', module: 'PROPERTY', action: 'LIST', name: 'List Properties' },

//   // ROOM TYPE
//   { code: 'room_type.create', module: 'ROOM_TYPE', action: 'CREATE', name: 'Create Room Type' },
//   { code: 'room_type.view', module: 'ROOM_TYPE', action: 'VIEW', name: 'View Room Type' },
//   { code: 'room_type.update', module: 'ROOM_TYPE', action: 'UPDATE', name: 'Update Room Type' },
//   { code: 'room_type.delete', module: 'ROOM_TYPE', action: 'DELETE', name: 'Delete Room Type' },
//   { code: 'room_type.list', module: 'ROOM_TYPE', action: 'LIST', name: 'List Room Types' },

//   // ROOM
//   { code: 'room.create', module: 'ROOM', action: 'CREATE', name: 'Create Room' },
//   { code: 'room.view', module: 'ROOM', action: 'VIEW', name: 'View Room' },
//   { code: 'room.update', module: 'ROOM', action: 'UPDATE', name: 'Update Room' },
//   { code: 'room.delete', module: 'ROOM', action: 'DELETE', name: 'Delete Room' },
//   { code: 'room.list', module: 'ROOM', action: 'LIST', name: 'List Rooms' },
//   { code: 'room.block', module: 'ROOM', action: 'BLOCK', name: 'Block Room' },
//   { code: 'room.unblock', module: 'ROOM', action: 'UNBLOCK', name: 'Unblock Room' },

//   // RATE PLAN
//   { code: 'rate_plan.create', module: 'RATE_PLAN', action: 'CREATE', name: 'Create Rate Plan' },
//   { code: 'rate_plan.view', module: 'RATE_PLAN', action: 'VIEW', name: 'View Rate Plan' },
//   { code: 'rate_plan.update', module: 'RATE_PLAN', action: 'UPDATE', name: 'Update Rate Plan' },
//   { code: 'rate_plan.delete', module: 'RATE_PLAN', action: 'DELETE', name: 'Delete Rate Plan' },
//   { code: 'rate_plan.list', module: 'RATE_PLAN', action: 'LIST', name: 'List Rate Plans' },

//   // RESERVATION
//   { code: 'reservation.create', module: 'RESERVATION', action: 'CREATE', name: 'Create Reservation' },
//   { code: 'reservation.view', module: 'RESERVATION', action: 'VIEW', name: 'View Reservation' },
//   { code: 'reservation.update', module: 'RESERVATION', action: 'UPDATE', name: 'Update Reservation' },
//   { code: 'reservation.delete', module: 'RESERVATION', action: 'DELETE', name: 'Delete Reservation' },
//   { code: 'reservation.list', module: 'RESERVATION', action: 'LIST', name: 'List Reservations' },
//   { code: 'reservation.checkin', module: 'RESERVATION', action: 'CHECKIN', name: 'Check In Guest' },
//   { code: 'reservation.checkout', module: 'RESERVATION', action: 'CHECKOUT', name: 'Check Out Guest' },
//   { code: 'reservation.cancel', module: 'RESERVATION', action: 'CANCEL', name: 'Cancel Reservation' },

//   // GUEST
//   { code: 'guest.create', module: 'GUEST', action: 'CREATE', name: 'Create Guest' },
//   { code: 'guest.view', module: 'GUEST', action: 'VIEW', name: 'View Guest' },
//   { code: 'guest.update', module: 'GUEST', action: 'UPDATE', name: 'Update Guest' },
//   { code: 'guest.delete', module: 'GUEST', action: 'DELETE', name: 'Delete Guest' },
//   { code: 'guest.list', module: 'GUEST', action: 'LIST', name: 'List Guests' },

//   // USER
//   { code: 'user.create', module: 'USER', action: 'CREATE', name: 'Create User' },
//   { code: 'user.view', module: 'USER', action: 'VIEW', name: 'View User' },
//   { code: 'user.update', module: 'USER', action: 'UPDATE', name: 'Update User' },
//   { code: 'user.delete', module: 'USER', action: 'DELETE', name: 'Delete User' },
//   { code: 'user.list', module: 'USER', action: 'LIST', name: 'List Users' },
//   { code: 'user.activate', module: 'USER', action: 'ACTIVATE', name: 'Activate User' },
//   { code: 'user.deactivate', module: 'USER', action: 'DEACTIVATE', name: 'Deactivate User' },

//   // ROLE
//   { code: 'role.create', module: 'ROLE', action: 'CREATE', name: 'Create Role' },
//   { code: 'role.view', module: 'ROLE', action: 'VIEW', name: 'View Role' },
//   { code: 'role.update', module: 'ROLE', action: 'UPDATE', name: 'Update Role' },
//   { code: 'role.delete', module: 'ROLE', action: 'DELETE', name: 'Delete Role' },
//   { code: 'role.list', module: 'ROLE', action: 'LIST', name: 'List Roles' },
//   { code: 'role.assign', module: 'ROLE', action: 'ASSIGN', name: 'Assign Role' },

//   // PERMISSION
//   { code: 'permission.create', module: 'PERMISSION', action: 'CREATE', name: 'Create Permission' },
//   { code: 'permission.view', module: 'PERMISSION', action: 'VIEW', name: 'View Permission' },
//   { code: 'permission.update', module: 'PERMISSION', action: 'UPDATE', name: 'Update Permission' },
//   { code: 'permission.delete', module: 'PERMISSION', action: 'DELETE', name: 'Delete Permission' },
//   { code: 'permission.list', module: 'PERMISSION', action: 'LIST', name: 'List Permissions' },
//   { code: 'permission.assign', module: 'PERMISSION', action: 'ASSIGN', name: 'Assign Permission' },

//   // BILLING
//   { code: 'billing.create', module: 'BILLING', action: 'CREATE', name: 'Create Billing' },
//   { code: 'billing.view', module: 'BILLING', action: 'VIEW', name: 'View Billing' },
//   { code: 'billing.update', module: 'BILLING', action: 'UPDATE', name: 'Update Billing' },
//   { code: 'billing.invoice', module: 'BILLING', action: 'INVOICE', name: 'Generate Invoice' },
//   { code: 'billing.refund', module: 'BILLING', action: 'REFUND', name: 'Process Refund' },

//   // PAYMENT
//   { code: 'payment.create', module: 'PAYMENT', action: 'CREATE', name: 'Create Payment' },
//   { code: 'payment.view', module: 'PAYMENT', action: 'VIEW', name: 'View Payment' },
//   { code: 'payment.refund', module: 'PAYMENT', action: 'REFUND', name: 'Refund Payment' },

//   // HOUSEKEEPING
//   { code: 'housekeeping.create', module: 'HOUSEKEEPING', action: 'CREATE', name: 'Create Housekeeping Task' },
//   { code: 'housekeeping.view', module: 'HOUSEKEEPING', action: 'VIEW', name: 'View Housekeeping Task' },
//   { code: 'housekeeping.update', module: 'HOUSEKEEPING', action: 'UPDATE', name: 'Update Housekeeping Task' },
//   { code: 'housekeeping.assign', module: 'HOUSEKEEPING', action: 'ASSIGN', name: 'Assign Housekeeping Task' },
//   { code: 'housekeeping.complete', module: 'HOUSEKEEPING', action: 'COMPLETE', name: 'Complete Housekeeping Task' },

//   // INVENTORY
//   { code: 'inventory.create', module: 'INVENTORY', action: 'CREATE', name: 'Create Inventory Item' },
//   { code: 'inventory.view', module: 'INVENTORY', action: 'VIEW', name: 'View Inventory Item' },
//   { code: 'inventory.update', module: 'INVENTORY', action: 'UPDATE', name: 'Update Inventory Item' },
//   { code: 'inventory.stock_in', module: 'INVENTORY', action: 'STOCK_IN', name: 'Stock In Inventory' },
//   { code: 'inventory.stock_out', module: 'INVENTORY', action: 'STOCK_OUT', name: 'Stock Out Inventory' },

//   // REPORTS
//   { code: 'report.view', module: 'REPORT', action: 'VIEW', name: 'View Reports' },
//   { code: 'report.export', module: 'REPORT', action: 'EXPORT', name: 'Export Reports' },

//   // DASHBOARD
//   { code: 'dashboard.view', module: 'DASHBOARD', action: 'VIEW', name: 'View Dashboard' },

//   // SETTINGS
//   { code: 'settings.view', module: 'SETTINGS', action: 'VIEW', name: 'View Settings' },
//   { code: 'settings.update', module: 'SETTINGS', action: 'UPDATE', name: 'Update Settings' },
// ];

const permissions = [
  // // AUTH
  // { code: 'auth.login', module: 'AUTH', action: 'LOGIN', name: 'Login' },
  // { code: 'auth.logout', module: 'AUTH', action: 'LOGOUT', name: 'Logout' },
  // { code: 'auth.refresh_token', module: 'AUTH', action: 'REFRESH_TOKEN', name: 'Refresh Token' },
  // { code: 'auth.change_password', module: 'AUTH', action: 'CHANGE_PASSWORD', name: 'Change Password' },

  // // TENANT
  // { code: 'tenant.create', module: 'TENANT', action: 'CREATE', name: 'Create Tenant' },
  // { code: 'tenant.view', module: 'TENANT', action: 'VIEW', name: 'View Tenant' },
  // { code: 'tenant.update', module: 'TENANT', action: 'UPDATE', name: 'Update Tenant' },
  // { code: 'tenant.delete', module: 'TENANT', action: 'DELETE', name: 'Delete Tenant' },
  // { code: 'tenant.list', module: 'TENANT', action: 'LIST', name: 'List Tenants' },

  // // PROPERTY
  // { code: 'property.create', module: 'PROPERTY', action: 'CREATE', name: 'Create Property' },
  // { code: 'property.view', module: 'PROPERTY', action: 'VIEW', name: 'View Property' },
  // { code: 'property.update', module: 'PROPERTY', action: 'UPDATE', name: 'Update Property' },
  // { code: 'property.delete', module: 'PROPERTY', action: 'DELETE', name: 'Delete Property' },
  // { code: 'property.list', module: 'PROPERTY', action: 'LIST', name: 'List Properties' },

  // // ROOM TYPE
  // { code: 'room_type.create', module: 'ROOM_TYPE', action: 'CREATE', name: 'Create Room Type' },
  // { code: 'room_type.view', module: 'ROOM_TYPE', action: 'VIEW', name: 'View Room Type' },
  // { code: 'room_type.update', module: 'ROOM_TYPE', action: 'UPDATE', name: 'Update Room Type' },
  // { code: 'room_type.delete', module: 'ROOM_TYPE', action: 'DELETE', name: 'Delete Room Type' },
  // { code: 'room_type.list', module: 'ROOM_TYPE', action: 'LIST', name: 'List Room Types' },

  // // ROOM
  // { code: 'room.create', module: 'ROOM', action: 'CREATE', name: 'Create Room' },
  // { code: 'room.view', module: 'ROOM', action: 'VIEW', name: 'View Room' },
  // { code: 'room.update', module: 'ROOM', action: 'UPDATE', name: 'Update Room' },
  // { code: 'room.delete', module: 'ROOM', action: 'DELETE', name: 'Delete Room' },
  // { code: 'room.list', module: 'ROOM', action: 'LIST', name: 'List Rooms' },
  // { code: 'room.block', module: 'ROOM', action: 'BLOCK', name: 'Block Room' },
  // { code: 'room.unblock', module: 'ROOM', action: 'UNBLOCK', name: 'Unblock Room' },

  // // RATE PLAN
  // { code: 'rate_plan.create', module: 'RATE_PLAN', action: 'CREATE', name: 'Create Rate Plan' },
  // { code: 'rate_plan.view', module: 'RATE_PLAN', action: 'VIEW', name: 'View Rate Plan' },
  // { code: 'rate_plan.update', module: 'RATE_PLAN', action: 'UPDATE', name: 'Update Rate Plan' },
  // { code: 'rate_plan.delete', module: 'RATE_PLAN', action: 'DELETE', name: 'Delete Rate Plan' },
  // { code: 'rate_plan.list', module: 'RATE_PLAN', action: 'LIST', name: 'List Rate Plans' },

  // // RESERVATION
  // { code: 'reservation.create', module: 'RESERVATION', action: 'CREATE', name: 'Create Reservation' },
  // { code: 'reservation.view', module: 'RESERVATION', action: 'VIEW', name: 'View Reservation' },
  // { code: 'reservation.update', module: 'RESERVATION', action: 'UPDATE', name: 'Update Reservation' },
  // { code: 'reservation.delete', module: 'RESERVATION', action: 'DELETE', name: 'Delete Reservation' },
  // { code: 'reservation.list', module: 'RESERVATION', action: 'LIST', name: 'List Reservations' },
  // { code: 'reservation.checkin', module: 'RESERVATION', action: 'CHECKIN', name: 'Check In Guest' },
  // { code: 'reservation.checkout', module: 'RESERVATION', action: 'CHECKOUT', name: 'Check Out Guest' },
  // { code: 'reservation.cancel', module: 'RESERVATION', action: 'CANCEL', name: 'Cancel Reservation' },

  // // GUEST
  // { code: 'guest.create', module: 'GUEST', action: 'CREATE', name: 'Create Guest' },
  // { code: 'guest.view', module: 'GUEST', action: 'VIEW', name: 'View Guest' },
  // { code: 'guest.update', module: 'GUEST', action: 'UPDATE', name: 'Update Guest' },
  // { code: 'guest.delete', module: 'GUEST', action: 'DELETE', name: 'Delete Guest' },
  // { code: 'guest.list', module: 'GUEST', action: 'LIST', name: 'List Guests' },

  // USER
  { code: 'user.create',  action: 'CREATE', name: 'Create User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.view',  action: 'VIEW', name: 'View User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.update',  action: 'UPDATE', name: 'Update User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.delete',  action: 'DELETE', name: 'Delete User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.list',  action: 'LIST', name: 'List Users' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.activate',  action: 'ACTIVATE', name: 'Activate User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },
  { code: 'user.deactivate',  action: 'DEACTIVATE', name: 'Deactivate User' ,moduleId :"2ac75aa8-b51a-41f7-ba07-6057c8883478" },

  // // ROLE
  // { code: 'role.create', module: 'ROLE', action: 'CREATE', name: 'Create Role' },
  // { code: 'role.view', module: 'ROLE', action: 'VIEW', name: 'View Role' },
  // { code: 'role.update', module: 'ROLE', action: 'UPDATE', name: 'Update Role' },
  // { code: 'role.delete', module: 'ROLE', action: 'DELETE', name: 'Delete Role' },
  // { code: 'role.list', module: 'ROLE', action: 'LIST', name: 'List Roles' },
  // { code: 'role.assign', module: 'ROLE', action: 'ASSIGN', name: 'Assign Role' },

  // // PERMISSION
  // { code: 'permission.create', module: 'PERMISSION', action: 'CREATE', name: 'Create Permission' },
  // { code: 'permission.view', module: 'PERMISSION', action: 'VIEW', name: 'View Permission' },
  // { code: 'permission.update', module: 'PERMISSION', action: 'UPDATE', name: 'Update Permission' },
  // { code: 'permission.delete', module: 'PERMISSION', action: 'DELETE', name: 'Delete Permission' },
  // { code: 'permission.list', module: 'PERMISSION', action: 'LIST', name: 'List Permissions' },
  // { code: 'permission.assign', module: 'PERMISSION', action: 'ASSIGN', name: 'Assign Permission' },

  // // BILLING
  // { code: 'billing.create', module: 'BILLING', action: 'CREATE', name: 'Create Billing' },
  // { code: 'billing.view', module: 'BILLING', action: 'VIEW', name: 'View Billing' },
  // { code: 'billing.update', module: 'BILLING', action: 'UPDATE', name: 'Update Billing' },
  // { code: 'billing.invoice', module: 'BILLING', action: 'INVOICE', name: 'Generate Invoice' },
  // { code: 'billing.refund', module: 'BILLING', action: 'REFUND', name: 'Process Refund' },

  // // PAYMENT
  // { code: 'payment.create', module: 'PAYMENT', action: 'CREATE', name: 'Create Payment' },
  // { code: 'payment.view', module: 'PAYMENT', action: 'VIEW', name: 'View Payment' },
  // { code: 'payment.refund', module: 'PAYMENT', action: 'REFUND', name: 'Refund Payment' },

  // // HOUSEKEEPING
  // { code: 'housekeeping.create', module: 'HOUSEKEEPING', action: 'CREATE', name: 'Create Housekeeping Task' },
  // { code: 'housekeeping.view', module: 'HOUSEKEEPING', action: 'VIEW', name: 'View Housekeeping Task' },
  // { code: 'housekeeping.update', module: 'HOUSEKEEPING', action: 'UPDATE', name: 'Update Housekeeping Task' },
  // { code: 'housekeeping.assign', module: 'HOUSEKEEPING', action: 'ASSIGN', name: 'Assign Housekeeping Task' },
  // { code: 'housekeeping.complete', module: 'HOUSEKEEPING', action: 'COMPLETE', name: 'Complete Housekeeping Task' },

  // // INVENTORY
  // { code: 'inventory.create', module: 'INVENTORY', action: 'CREATE', name: 'Create Inventory Item' },
  // { code: 'inventory.view', module: 'INVENTORY', action: 'VIEW', name: 'View Inventory Item' },
  // { code: 'inventory.update', module: 'INVENTORY', action: 'UPDATE', name: 'Update Inventory Item' },
  // { code: 'inventory.stock_in', module: 'INVENTORY', action: 'STOCK_IN', name: 'Stock In Inventory' },
  // { code: 'inventory.stock_out', module: 'INVENTORY', action: 'STOCK_OUT', name: 'Stock Out Inventory' },

  // // REPORTS
  // { code: 'report.view', module: 'REPORT', action: 'VIEW', name: 'View Reports' },
  // { code: 'report.export', module: 'REPORT', action: 'EXPORT', name: 'Export Reports' },

  // // DASHBOARD
  // { code: 'dashboard.view', module: 'DASHBOARD', action: 'VIEW', name: 'View Dashboard' },

  // // SETTINGS
  // { code: 'settings.view', module: 'SETTINGS', action: 'VIEW', name: 'View Settings' },
  // { code: 'settings.update', module: 'SETTINGS', action: 'UPDATE', name: 'Update Settings' },
];

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const superAdmin = await prisma.role.findUnique({
    where: {
      code: "SUPER_ADMIN",
    },
  });

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {},
      create: {
        ...permission,
        isSystem: true,
      },
    });
  }

  // Assign all permissions to Super Admin
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin!.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin!.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Roles seeded');
  console.log('✅ Permissions seeded');
  console.log('✅ Role Permissions seeded');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });