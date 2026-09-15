import test from 'node:test';
import assert from 'node:assert/strict';
import { sortByName } from './sort-by-name.js';

test('sorts names naturally, case-insensitively, without mutating input', () => {
  const values = [
    { id: 10, name: 'box 10' },
    { id: 2, name: 'Box 2' },
    { id: 1, name: 'alpha' },
  ];
  const original = [...values];

  assert.deepEqual(sortByName(values), [
    { id: 1, name: 'alpha' },
    { id: 2, name: 'Box 2' },
    { id: 10, name: 'box 10' },
  ]);
  assert.deepEqual(values, original);
});

test('sorts descending and handles missing names deterministically', () => {
  const values = [
    { id: 1, name: 'Alpha' },
    { id: 3 },
    { id: 2, name: 'alpha' },
  ];

  assert.deepEqual(sortByName(values, 'desc'), [
    { id: 2, name: 'alpha' },
    { id: 1, name: 'Alpha' },
    { id: 3 },
  ]);
});
