// admin_comp_membership_action_handlers.ts

export const bulkUpdateStoreType = async (
  selectedMembershipIds: any[],
  bulkStoreType: string,
  fetchIntegratedBulkData?: (mode: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void>,
  fetchCloudMembers?: () => Promise<void>
) => {
  const res = await fetch('/api/registered-members/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, storeType: bulkStoreType })
  });
  return await res.json();
};

export const bulkUpdateStoreGrade = async (
  selectedMembershipIds: any[],
  bulkStoreGrade: string,
  fetchIntegratedBulkData?: (mode: 'CLOUD_SQL' | 'LOCAL_SIM') => Promise<void>,
  fetchCloudMembers?: () => Promise<void>
) => {
  const res = await fetch('/api/registered-members/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, storeGrade: bulkStoreGrade })
  });
  return await res.json();
};

export const bulkApproveLicenses = async (
  selectedMembershipIds: any[],
  months: number
) => {
  const res = await fetch('/api/licenses/bulk-approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, months })
  });
  return await res.json();
};

export const bulkExpireLicenses = async (
  selectedMembershipIds: any[]
) => {
  const res = await fetch('/api/licenses/bulk-approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, mode: 'expire' })
  });
  return await res.json();
};

export const bulkImminentLicenses = async (
  selectedMembershipIds: any[]
) => {
  const res = await fetch('/api/licenses/bulk-approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, mode: 'imminent' })
  });
  return await res.json();
};

export const bulkSuspendMembers = async (
  selectedMembershipIds: any[],
  suspend: boolean
) => {
  const res = await fetch('/api/registered-members/bulk-suspend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: selectedMembershipIds, suspend })
  });
  return await res.json();
};
