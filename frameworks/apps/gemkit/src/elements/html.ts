/**
 * 服务端已经转换和清理过的 HTML，Light DOM 中输出，主题样式可以作用于内容
 *
 * 水合时父元素还没有设置 `content`，保留服务端输出的内容
 */
@customElement('app-html')
export class AppHtmlElement extends GemElement {
  @property content?: string;

  @template()
  #content = () => {
    if (this.content !== undefined) this.innerHTML = this.content;
    return undefined;
  };
}
