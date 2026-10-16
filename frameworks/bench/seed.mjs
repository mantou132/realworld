// Fills an empty API with the same deterministic data for every benchmark run.
// Usage: node bench/seed.mjs [apiBase]

const API = process.argv[2] || process.env.API_BASE || 'http://localhost:3100/api';
const AVATAR = '/default-avatar.svg';

async function call(method, path, body, token) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Token ${token}` }) },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Small seeded PRNG so the content is identical on every run
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = (list) => list[Math.floor(rand() * list.length)];

const words =
  'framework render hydrate stream server client bundle route layout component state signal store cache request response markdown article comment profile follow favorite feed tag performance network latency template element shadow style module chunk island resume compile runtime'.split(
    ' ',
  );
const sentence = (n = 8 + Math.floor(rand() * 10)) => {
  const s = Array.from({ length: n }, () => pick(words)).join(' ');
  return `${s[0].toUpperCase()}${s.slice(1)}.`;
};
const paragraph = () => Array.from({ length: 4 + Math.floor(rand() * 3) }, () => sentence()).join(' ');

const body = (title) =>
  [
    paragraph(),
    `## Why ${title.toLowerCase()} matters`,
    paragraph(),
    paragraph(),
    '- ' + sentence(6),
    '- ' + sentence(6),
    '- ' + sentence(6),
    '```ts\nconst result = await fetch(`/api/articles?limit=10`);\nconsole.log(await result.json());\n```',
    `## ${sentence(4).slice(0, -1)}`,
    paragraph(),
    `> ${sentence()}`,
    paragraph(),
  ].join('\n\n');

const tags = ['javascript', 'ssr', 'performance', 'webcomponents', 'svelte', 'react', 'vue', 'gem', 'css', 'testing'];

const users = [
  { username: 'johndoe', email: 'john@example.com', bio: 'Writes about rendering.' },
  { username: 'janedoe', email: 'jane@example.com', bio: 'Frontend performance nerd.' },
  { username: 'alice', email: 'alice@example.com', bio: null },
  { username: 'bob', email: 'bob@example.com', bio: 'Ships things.' },
];

const tokens = {};
for (const u of users) {
  const { user } = await call('POST', 'users', {
    user: { username: u.username, email: u.email, password: 'password123' },
  });
  tokens[u.username] = user.token;
  await call('PUT', 'user', { user: { image: AVATAR, ...(u.bio && { bio: u.bio }) } }, user.token);
}

const slugs = [];
for (let i = 0; i < 25; i++) {
  const author = users[i % users.length].username;
  const title = `${sentence(4).slice(0, -1)} ${i + 1}`;
  const tagList = [...new Set([pick(tags), pick(tags), pick(tags)])];
  const { article } = await call(
    'POST',
    'articles',
    { article: { title, description: sentence(10), body: body(title), tagList } },
    tokens[author],
  );
  slugs.push(article.slug);
}

// Comments, favorites and follows
for (const [i, slug] of slugs.entries()) {
  for (let c = 0; c < (i < 5 ? 6 : 2); c++) {
    await call('POST', `articles/${slug}/comments`, { comment: { body: paragraph() } }, tokens[pick(users).username]);
  }
  for (const u of users) if (rand() < 0.4) await call('POST', `articles/${slug}/favorite`, null, tokens[u.username]);
}
await call('POST', 'profiles/janedoe/follow', null, tokens.johndoe);
await call('POST', 'profiles/alice/follow', null, tokens.johndoe);

console.log(`seeded ${users.length} users, ${slugs.length} articles; first article: /article/${slugs.at(-1)}`);
