import { getSupabase } from './auth.js';
import { isSupabaseConfigured } from '../config/supabase.js';

export const ARTICLE_COVERS_BUCKET = 'article-covers';

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * @param {File} file
 * @returns {string}
 */
function fileExtension(file) {
  const fromName = String(file.name || '')
    .split('.')
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (fromName && fromName.length <= 5) return fromName;

  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/gif') return 'gif';
  return 'jpg';
}

/**
 * Unique object path: {userId}/{timestamp}-{random}.{ext}
 * @param {string} userId
 * @param {File} file
 */
export function buildArticleCoverPath(userId, file) {
  const stamp = Date.now().toString(36);
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const ext = fileExtension(file);
  return `${userId}/${stamp}-${rand}.${ext}`;
}

/**
 * @param {File | null | undefined} file
 * @returns {string | null} human-readable error or null if ok
 */
export function validateCoverImageFile(file) {
  if (!file) return 'Изберете файл за качване.';
  if (!ALLOWED_MIME.has(file.type)) {
    return 'Позволени формати: JPEG, PNG, WebP, GIF.';
  }
  if (file.size > MAX_COVER_BYTES) {
    return 'Файлът е твърде голям (макс. 5 МБ).';
  }
  return null;
}

/**
 * Upload cover image to public bucket `article-covers`.
 * @param {{ file: File, userId: string, onProgress?: (label: string) => void }} opts
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export async function uploadArticleCover({ file, userId, onProgress }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase не е конфигуриран.');
  }
  if (!userId) {
    throw new Error('Липсва потребител за качване.');
  }

  const validationError = validateCoverImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase клиентът не е наличен.');
  }

  const path = buildArticleCoverPath(userId, file);
  onProgress?.('Качване на изображение…');

  const { error } = await supabase.storage.from(ARTICLE_COVERS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });

  if (error) {
    console.error('uploadArticleCover', error);
    throw new Error(formatStorageError(error));
  }

  const { data } = supabase.storage.from(ARTICLE_COVERS_BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error('Качването успя, но публичният адрес липсва.');
  }

  onProgress?.('Изображението е качено.');
  return { publicUrl, path };
}

/**
 * Best-effort delete by public URL (owners / admins only via RLS).
 * @param {string} publicUrl
 */
export async function deleteArticleCoverByUrl(publicUrl) {
  if (!publicUrl || !isSupabaseConfigured()) return;

  const marker = `/object/public/${ARTICLE_COVERS_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const path = decodeURIComponent(publicUrl.slice(idx + marker.length));
  if (!path) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.storage.from(ARTICLE_COVERS_BUCKET).remove([path]);
  if (error) {
    console.warn('deleteArticleCoverByUrl', error);
  }
}

/**
 * @param {unknown} error
 */
export function formatStorageError(error) {
  const message = String(
    /** @type {{ message?: string }} */ (error)?.message ?? error ?? '',
  );

  if (/payload too large|maximum|size/i.test(message)) {
    return 'Файлът е твърде голям (макс. 5 МБ).';
  }
  if (/mime|type|not allowed/i.test(message)) {
    return 'Позволени формати: JPEG, PNG, WebP, GIF.';
  }
  if (/row-level security|policy|unauthorized|403/i.test(message)) {
    return 'Нямате права за качване. Влезте отново като автор или администратор.';
  }
  if (/network|fetch|failed to fetch|load failed/i.test(message)) {
    return 'Няма връзка със сървъра при качване. Опитайте отново.';
  }
  return message || 'Качването на изображението не бе успешно.';
}
