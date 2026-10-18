import type { RsvpRecord, Companion } from './rsvpService';

export type ConflictType = 'driver_vs_companion' | 'companion_vs_companion' | 'driver_vs_driver';

export interface ConflictParty {
  recordId: string;
  driverName: string;
  relationship: string;
  createdAt: string;
  isDriver: boolean;
  companionId?: string;
  companionName?: string;
  companionType?: 'Kid' | 'Adult';
}

export interface DetectedConflict {
  id: string;
  canonicalName: string;
  type: ConflictType;
  primary: ConflictParty;
  conflicting: ConflictParty;
  isResolved: boolean;
  isDeduplicated: boolean; // True if the conflicting entity is excluded from headcount
  adminVerified: boolean;
}

/**
 * Normalizes a guest name for robust, case-insensitive comparison.
 * Strips extra whitespace, periods, hyphens, and casing.
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Calculates the net headcount for a single RSVP record,
 * automatically excluding any companions or drivers flagged as duplicates.
 */
export function calculateRecordHeadcount(record: RsvpRecord): number {
  if (!record.attending) return 0;
  if (record.isDuplicate) return 0;

  let count = 1; // Primary driver
  if (Array.isArray(record.companions)) {
    record.companions.forEach((c) => {
      if (!c.isDuplicate) {
        count += 1;
      }
    });
  }
  return count;
}

/**
 * Scans all RSVPs across the grid and detects name collisions between:
 * 1. An accompanying guest and a primary registered driver (Primary Case)
 * 2. An accompanying guest and another accompanying guest across tickets
 * 3. Two primary registered drivers with identical names
 */
export function detectConflicts(rsvps: RsvpRecord[]): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const processedPairs = new Set<string>();

  // Only consider active/attending registrations for duplicate counting issues
  const attendingRsvps = rsvps.filter((r) => r.attending);

  // 1. Check: Accompany matching a Primary Registered Driver
  // (e.g. Jane Doe registers as a driver, but John Doe also listed Jane Doe as accompany)
  attendingRsvps.forEach((driverRecord) => {
    const driverNorm = normalizeName(driverRecord.guest_name);
    if (!driverNorm || driverNorm.length < 2) return;

    attendingRsvps.forEach((otherRecord) => {
      if (otherRecord.id === driverRecord.id) return; // Same RSVP
      if (!Array.isArray(otherRecord.companions)) return;

      otherRecord.companions.forEach((comp) => {
        const compNorm = normalizeName(comp.fullName);
        if (compNorm && compNorm.length >= 2 && compNorm === driverNorm) {
          const pairKey = `drv-comp-${driverRecord.id}-${otherRecord.id}-${comp.id}`;
          if (processedPairs.has(pairKey)) return;
          processedPairs.add(pairKey);

          conflicts.push({
            id: pairKey,
            canonicalName: comp.fullName.trim() || driverRecord.guest_name.trim(),
            type: 'driver_vs_companion',
            primary: {
              recordId: driverRecord.id,
              driverName: driverRecord.guest_name,
              relationship: driverRecord.relationship || 'Guest',
              createdAt: driverRecord.created_at,
              isDriver: true,
            },
            conflicting: {
              recordId: otherRecord.id,
              driverName: otherRecord.guest_name,
              relationship: otherRecord.relationship || 'Guest',
              createdAt: otherRecord.created_at,
              isDriver: false,
              companionId: comp.id,
              companionName: comp.fullName,
              companionType: comp.type,
            },
            isResolved: Boolean(comp.adminVerified),
            isDeduplicated: Boolean(comp.isDuplicate),
            adminVerified: Boolean(comp.adminVerified),
          });
        }
      });
    });
  });

  // 2. Check: Accompany matching another Accompany on a different ticket
  // (e.g. John Doe lists Jane Smith, and Bob Miller ALSO lists Jane Smith)
  const allCompanions: {
    record: RsvpRecord;
    comp: Companion;
    norm: string;
  }[] = [];

  attendingRsvps.forEach((record) => {
    if (Array.isArray(record.companions)) {
      record.companions.forEach((comp) => {
        const norm = normalizeName(comp.fullName);
        if (norm && norm.length >= 2) {
          allCompanions.push({ record, comp, norm });
        }
      });
    }
  });

  for (let i = 0; i < allCompanions.length; i++) {
    for (let j = i + 1; j < allCompanions.length; j++) {
      const c1 = allCompanions[i];
      const c2 = allCompanions[j];

      if (c1.record.id === c2.record.id) continue; // Same ticket

      if (c1.norm === c2.norm) {
        // Only flag if neither is already flagged as a companion-to-driver match
        const isAlreadyDriverComp = conflicts.some(
          (cf) =>
            cf.type === 'driver_vs_companion' &&
            (cf.conflicting.companionId === c1.comp.id || cf.conflicting.companionId === c2.comp.id)
        );
        if (isAlreadyDriverComp) continue;

        const pairKey = `comp-comp-${c1.comp.id}-${c2.comp.id}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        conflicts.push({
          id: pairKey,
          canonicalName: c1.comp.fullName.trim(),
          type: 'companion_vs_companion',
          primary: {
            recordId: c1.record.id,
            driverName: c1.record.guest_name,
            relationship: c1.record.relationship || 'Guest',
            createdAt: c1.record.created_at,
            isDriver: false,
            companionId: c1.comp.id,
            companionName: c1.comp.fullName,
            companionType: c1.comp.type,
          },
          conflicting: {
            recordId: c2.record.id,
            driverName: c2.record.guest_name,
            relationship: c2.record.relationship || 'Guest',
            createdAt: c2.record.created_at,
            isDriver: false,
            companionId: c2.comp.id,
            companionName: c2.comp.fullName,
            companionType: c2.comp.type,
          },
          isResolved: Boolean(c1.comp.adminVerified || c2.comp.adminVerified),
          isDeduplicated: Boolean(c1.comp.isDuplicate || c2.comp.isDuplicate),
          adminVerified: Boolean(c1.comp.adminVerified || c2.comp.adminVerified),
        });
      }
    }
  }

  // 3. Check: Primary Driver matching another Primary Driver
  for (let i = 0; i < attendingRsvps.length; i++) {
    for (let j = i + 1; j < attendingRsvps.length; j++) {
      const r1 = attendingRsvps[i];
      const r2 = attendingRsvps[j];

      const n1 = normalizeName(r1.guest_name);
      const n2 = normalizeName(r2.guest_name);

      if (n1 && n1.length >= 2 && n1 === n2) {
        const pairKey = `drv-drv-${r1.id}-${r2.id}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        conflicts.push({
          id: pairKey,
          canonicalName: r1.guest_name.trim(),
          type: 'driver_vs_driver',
          primary: {
            recordId: r1.id,
            driverName: r1.guest_name,
            relationship: r1.relationship || 'Guest',
            createdAt: r1.created_at,
            isDriver: true,
          },
          conflicting: {
            recordId: r2.id,
            driverName: r2.guest_name,
            relationship: r2.relationship || 'Guest',
            createdAt: r2.created_at,
            isDriver: true,
          },
          isResolved: Boolean(r2.adminVerified),
          isDeduplicated: Boolean(r2.isDuplicate),
          adminVerified: Boolean(r2.adminVerified),
        });
      }
    }
  }

  return conflicts;
}
