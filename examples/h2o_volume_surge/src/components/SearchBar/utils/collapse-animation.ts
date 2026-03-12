/**
 * 切换容器的展开/收起状态，并执行高度过渡动画
 * @param element - 要执行动画的 DOM 元素
 * @param duration - 动画持续时间(毫秒),默认 300ms
 * @param onComplete - 动画完成后的回调函数
 */
export const toggleCollapseAnimation = (
  element: HTMLElement | null | undefined,
  duration: number = 300,
  onComplete?: () => void
): void => {
  if (!element) return;

  const currentHeight = element.scrollHeight;

  element.style.height = currentHeight + 'px';
  element.style.overflow = 'hidden';

  element.offsetHeight;

  requestAnimationFrame(() => {
    element.style.transition = 'none';
    element.style.height = 'auto';
    const targetHeight = element.scrollHeight;
    element.style.height = currentHeight + 'px';

    element.offsetHeight;

    requestAnimationFrame(() => {
      element.style.transition = `height ${duration / 1000}s ease`;
      element.style.height = targetHeight + 'px';

      setTimeout(() => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        onComplete?.();
      }, duration);
    });
  });
};
