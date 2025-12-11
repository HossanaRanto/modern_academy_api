import { FindOptionsWhere } from 'typeorm';

/**
 * Base interface for tenant-aware entities
 */
export interface TenantAware {
  academyId: string;
}

/**
 * Helper to add tenant filter to TypeORM queries
 */
export function withTenantFilter<T extends TenantAware>(
  tenantId: string,
  additionalWhere?: FindOptionsWhere<T>,
): FindOptionsWhere<T> {
  return {
    academyId: tenantId,
    ...additionalWhere,
  } as FindOptionsWhere<T>;
}

/**
 * Helper to validate tenant ownership
 */
export function validateTenantOwnership<T extends TenantAware>(
  entity: T | null,
  tenantId: string,
  resourceName = 'Resource',
): void {
  if (!entity) {
    throw new Error(`${resourceName} not found`);
  }

  if (entity.academyId !== tenantId) {
    throw new Error(
      `Access denied: This ${resourceName.toLowerCase()} belongs to a different academy`,
    );
  }
}
