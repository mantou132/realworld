import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// 文章和评论在服务端获取，markdown 在服务端转换，`marked` 和 `sanitize-html` 不会打包到客户端
export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig(event).public;
  const token = getCookie(event, 'jwt');
  const headers = token ? { Authorization: `Token ${token}` } : undefined;
  const slug = encodeURIComponent(getRouterParam(event, 'slug')!);
  const [{ article }, { comments }] = await Promise.all([
    $fetch<{ article: { body: string } }>(`${apiBase}/articles/${slug}`, { headers }),
    $fetch<{ comments: unknown[] }>(`${apiBase}/articles/${slug}/comments`, { headers }),
  ]);
  return { article: { ...article, body: sanitizeHtml(await marked(article.body)) }, comments };
});
