import { describe, expect, it } from 'vitest';
import { validateArticleForm } from '../../src/utils/articleValidation.js';

describe('validateArticleForm', () => {
  it('passes when required fields are present', () => {
    const result = validateArticleForm({
      title: 'Нова статия',
      rubricId: 'rubric-1',
      slug: 'nova-statiya',
      content: 'Текст на статията',
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports missing title, rubric, slug and content', () => {
    const result = validateArticleForm({});
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.field)).toEqual([
      'title',
      'rubricId',
      'slug',
      'content',
    ]);
  });

  it('treats empty Quill HTML as missing content', () => {
    const result = validateArticleForm({
      title: 'Заглавие',
      rubricId: 'x',
      slug: 'ok',
      content: '<p><br></p>',
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.field === 'content')).toBe(true);
  });
});
