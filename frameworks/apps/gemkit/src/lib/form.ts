import { submitAction } from '@mantou/gemkit';

/** 不刷新页面提交表单，返回 action 的结果，跳转和重新加载数据由 gemkit 处理 */
export const enhance =
  <T>(onResult?: (result: T | undefined) => void) =>
  async (evt: SubmitEvent) => {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const button = form.querySelector('button');
    if (button) button.disabled = true;
    try {
      const result = await submitAction(form, evt.submitter);
      onResult?.(result as T | undefined);
    } finally {
      if (button) button.disabled = false;
    }
  };
