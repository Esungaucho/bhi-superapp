import { base44 } from '@/api/base44Client';

/**
 * Admin data access helpers — all operations go through the admin-ops
 * backend function which verifies the caller is an authenticated admin
 * before performing service-role CRUD. Never call base44.asServiceRole
 * directly from browser code.
 */

export async function adminList(entity, sort, limit) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'list', sort, limit });
  return res.data;
}

export async function adminFilter(entity, query, sort, limit) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'filter', query, sort, limit });
  return res.data;
}

export async function adminGet(entity, id) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'get', id });
  return res.data;
}

export async function adminCreate(entity, data) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'create', data });
  return res.data;
}

export async function adminUpdate(entity, id, data) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'update', id, data });
  return res.data;
}

export async function adminDelete(entity, id) {
  const res = await base44.functions.invoke('admin-ops', { entity, operation: 'delete', id });
  return res.data;
}