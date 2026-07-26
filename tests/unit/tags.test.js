import { describe, expect, it } from 'vitest';
import {
  parseTagsInput,
  stringToTagsArray,
} from '../../src/services/articles.js';

describe('stringToTagsArray / parseTagsInput', () => {
  it('splits comma-separated tags and trims spaces', () => {
    expect(stringToTagsArray('notes, piano, grade 5, method')).toEqual([
      'notes',
      'piano',
      'grade 5',
      'method',
    ]);
  });

  it('removes empty segments and leading hashes', () => {
    expect(parseTagsInput('  #solfezh , , хорове  ,')).toEqual(['solfezh', 'хорове']);
  });

  it('dedupes case-insensitively but keeps first casing', () => {
    expect(parseTagsInput('Piano, piano, PIANO')).toEqual(['Piano']);
  });

  it('returns empty array for blank input', () => {
    expect(stringToTagsArray('')).toEqual([]);
    expect(stringToTagsArray('   ,  , ')).toEqual([]);
  });
});
