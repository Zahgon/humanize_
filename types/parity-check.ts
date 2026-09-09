/**
 * Compile-time parity check between:
 *  - the global HumanizeStatic interface declared in src/humanize.ts, and
 *  - the published declaration file types/humanize.d.ts (copied to
 *    dist/humanize.d.ts by the build).
 *
 * This file emits nothing useful at runtime; it exists purely so that
 * `npm run typecheck` fails if the two declarations drift apart.
 */

type DistHumanize = typeof import('./humanize');

type Extends<A, B> = A extends B ? true : false;

export const distIsAssignableToSource: Extends<DistHumanize, HumanizeStatic> = true;
export const sourceIsAssignableToDist: Extends<HumanizeStatic, DistHumanize> = true;
