import { describe, expect, it } from 'vitest';
import {
  articleMatchesKeyword,
  filterArticlesByKeyword,
} from '../../src/utils/articleSearch.js';

const sample = [
  {
    id: '1',
    title: 'Солфеж за начинаещи',
    summary: 'Практически подход',
    content: 'Упражнения с ритъм',
    tags: ['солфеж', 'методика'],
    rubrics: { title: 'Практики', slug: 'practices' },
  },
  {
    id: '2',
    title: 'El Sistema в училище',
    summary: 'Социално въздействие',
    content: 'Оркестър и ансамбъл',
    tags: ['оркестър'],
    rubrics: { title: 'El Sistema', slug: 'el-sistema' },
  },
  {
    id: '3',
    title: 'Образователни политики',
    summary: 'Рамки и реформи',
    content: 'Европейски документи',
    tags: ['политики'],
    rubrics: { title: 'Политики', slug: 'policies' },
  },
];

describe('filterArticlesByKeyword', () => {
  it('matches title case-insensitively', () => {
    expect(filterArticlesByKeyword(sample, 'СОЛФЕЖ').map((a) => a.id)).toEqual(['1']);
  });

  it('matches tags partially', () => {
    expect(filterArticlesByKeyword(sample, 'оркес').map((a) => a.id)).toEqual(['2']);
  });

  it('matches rubric title', () => {
    expect(filterArticlesByKeyword(sample, 'политик').map((a) => a.id)).toEqual(['3']);
  });

  it('matches content and summary', () => {
    expect(articleMatchesKeyword(sample[0], 'ритъм')).toBe(true);
    expect(articleMatchesKeyword(sample[1], 'въздействие')).toBe(true);
  });

  it('returns all articles for empty query', () => {
    expect(filterArticlesByKeyword(sample, '   ')).toHaveLength(3);
  });
});
