export function sortByName(values, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;

  return [...values].sort((left, right) => {
    const nameResult = String(left?.name ?? '').localeCompare(
      String(right?.name ?? ''),
      undefined,
      { sensitivity: 'base', numeric: true },
    );

    if (nameResult !== 0) return nameResult * factor;

    return (Number(left?.id ?? 0) - Number(right?.id ?? 0)) * factor;
  });
}

export function nextSortDirection(direction) {
  return direction === 'asc' ? 'desc' : 'asc';
}

export function sortLabel(direction, noun) {
  return `Sort ${noun} by name: ${direction === 'asc' ? 'ascending (A to Z)' : 'descending (Z to A)'}`;
}
