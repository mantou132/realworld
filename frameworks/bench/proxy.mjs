// 模拟部署时的 CDN / 反向代理：统一压缩所有应用的响应，不依赖各框架服务器自己的压缩设置
import http from 'node:http';
import zlib from 'node:zlib';

// 和常见 CDN 的默认设置一致：文本类型和未压缩的字体（ttf、otf、eot），woff/woff2 本身已经压缩
const compressible =
  /^(text\/|application\/(javascript|json|xml|x-font-ttf|vnd\.ms-fontobject)|image\/svg\+xml|font\/(ttf|otf))|\+json|\+xml/;

/** 转发到 `target`，向上游请求未压缩的内容，按 `Accept-Encoding` 用 br（等级 5）或 gzip（等级 6）压缩 */
export function startProxy(target, port) {
  const upstream = new URL(target);
  const server = http.createServer((req, res) => {
    const forward = http.request(
      {
        host: upstream.hostname,
        port: upstream.port,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: upstream.host, 'accept-encoding': 'identity' },
      },
      (up) => {
        const headers = { ...up.headers };
        const accept = String(req.headers['accept-encoding'] || '');
        const type = String(headers['content-type'] || '');
        const encoding =
          !headers['content-encoding'] && compressible.test(type) && req.method !== 'HEAD'
            ? accept.includes('br')
              ? 'br'
              : accept.includes('gzip')
                ? 'gzip'
                : null
            : null;
        if (!encoding) {
          res.writeHead(up.statusCode, headers);
          up.pipe(res);
          return;
        }
        delete headers['content-length'];
        headers['content-encoding'] = encoding;
        headers.vary = headers.vary ? `${headers.vary}, Accept-Encoding` : 'Accept-Encoding';
        res.writeHead(up.statusCode, headers);
        // 每个上游 chunk 都 flush，保留流式 SSR 的效果
        const compressor =
          encoding === 'br'
            ? zlib.createBrotliCompress({
                flush: zlib.constants.BROTLI_OPERATION_FLUSH,
                params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
              })
            : zlib.createGzip({ level: 6, flush: zlib.constants.Z_SYNC_FLUSH });
        up.pipe(compressor).pipe(res);
      },
    );
    forward.on('error', () => res.destroy());
    req.pipe(forward);
  });
  return new Promise((resolve) =>
    server.listen(port, () => resolve({ url: `http://localhost:${port}`, close: () => server.close() })),
  );
}
