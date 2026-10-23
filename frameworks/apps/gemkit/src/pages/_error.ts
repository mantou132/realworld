import type { ErrorData } from '@mantou/gemkit';

// 出错时渲染，也是未匹配路径的 404 页面
@page<{}, ErrorData>({ title: ({ data }) => (data.status === 404 ? 'Not found' : `Error ${data.status}`) })
export default class ErrorPage extends GemElement {
  @property data?: ErrorData;

  @template()
  #content = () =>
    html`<div class="container page"><h1>${this.data?.status === 404 ? 'Not found!' : this.data?.message}</h1></div>`;
}
