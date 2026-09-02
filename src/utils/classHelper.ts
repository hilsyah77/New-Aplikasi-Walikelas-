/**
 * Utility functions for Class Primary Key and Duplicate Data detection
 */

import { FullClassData } from '../types';

/**
 * Returns a consistent, URL and Firestore-safe Primary Key for a class.
 * E.g. "7A" -> "rombel_7a"
 * E.g. "8-B" -> "rombel_8_b"
 */
export function getClassPrimaryKey(className: string): string {
  const clean = (className || '7a')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');
  return `rombel_${clean}`;
}

/**
 * Normalizes class name for display or comparison
 */
export function normalizeClassName(className: string): string {
  return (className || '').trim().toUpperCase();
}

/**
 * Check if a class has already been saved in the database
 */
export function findDuplicateSavedClass(
  className: string,
  allClasses: FullClassData[],
  currentClassId?: string
): FullClassData | null {
  const normalizedTarget = normalizeClassName(className);
  const targetPrimaryKey = getClassPrimaryKey(className);

  for (const c of allClasses) {
    // Ignore if it's the exact same document being edited
    if (currentClassId && c.summary.id === currentClassId) {
      continue;
    }

    const cNormalized = normalizeClassName(c.summary.className);
    const cKey = getClassPrimaryKey(c.summary.className);

    // If class name or primary key matches and has been finalized/saved (has signature or student counts or signedAt)
    if (cNormalized === normalizedTarget || cKey === targetPrimaryKey || c.summary.id === targetPrimaryKey) {
      // Check if this record is actually saved (has signature, or signedAt, or student counts > 0)
      const hasCounts = (Number(c.summary.maleCount) || 0) + (Number(c.summary.femaleCount) || 0) > 0;
      const hasSignature = Boolean(c.summary.signatureDataUrl || c.summary.signedAt);
      if (hasCounts || hasSignature) {
        return c;
      }
    }
  }

  return null;
}
