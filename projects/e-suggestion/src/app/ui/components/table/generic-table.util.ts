type BackendOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'startswith'
  | 'endswith'
  | 'in';

type PrimeNgFilterMatchMode =
  | 'startsWith'
  | 'contains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'dateIs' // PrimeNG date filters
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter'
  | string; // Fallback for custom match modes

export const convertPrimeNgMatchModeToBackendOperator = (
  matchMode: PrimeNgFilterMatchMode
): BackendOperator => {
  switch (matchMode) {
    // Standard comparisons
    case 'equals':
    case 'dateIs': // 'dateIs' → 'eq'
      return 'eq';
    case 'notEquals':
    case 'dateIsNot': // 'dateIsNot' → 'ne'
      return 'ne';
    case 'gt':
    case 'dateAfter': // 'dateAfter' → 'gt'
      return 'gt';
    case 'lt':
    case 'dateBefore': // 'dateBefore' → 'lt'
      return 'lt';
    case 'gte':
      return 'gte';
    case 'lte':
      return 'lte';

    // String operations
    case 'contains':
    case 'notContains': // Assuming negation is handled separately
      return 'contains';
    case 'startsWith':
      return 'startswith';
    case 'endsWith':
      return 'endswith';

    // Special cases
    case 'in':
      return 'in';

    default:
      console.warn(
        `Unsupported PrimeNG match mode: ${matchMode}. Defaulting to 'eq'.`
      );
      return 'eq';
  }
};