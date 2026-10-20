/**
 * Deep equality and dirty comparison utility
 * Used by all four edit screens to determine if working copy differs from committed draft.
 */

export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  // Handle Objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }

  return true;
}

export function isSliceDirty<T>(workingCopy: T, committedSlice: T): boolean {
  return !isDeepEqual(workingCopy, committedSlice);
}
