import { notification as antNotification } from 'ant-design-vue';

/** 通知选项 */
export interface NoticeOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  /** 交互需求 */
  requireInteraction?: boolean;
  /** 自定义数据 */
  data?: unknown;
  /** 通知类型：默认 info */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** 持续时间（秒），0或null为不自动关闭 */
  duration?: number | null;
  onClick?: () => void;
}

/** 通知提供者接口 */
export interface NotificationProvider {
  name: string;
  notify(options: NoticeOptions): Promise<void> | void;
}

export abstract class BaseNotificationProvider implements NotificationProvider {
  constructor(public name: string) {}

  isSupported(): boolean {
    return true;
  }

  async notify(options: NoticeOptions): Promise<void> {
    if (!this.isSupported()) {
      return;
    }
    await this.doNotify(options);
  }

  protected abstract doNotify(options: NoticeOptions): Promise<void> | void;
}

/** 浏览器原生桌面通知 */
export class DesktopNotificationProvider extends BaseNotificationProvider {
  constructor() {
    super('desktop');
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  async getPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }

    return await Notification.requestPermission();
  }

  protected async doNotify(options: NoticeOptions): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const n = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      data: options.data
    });

    if (options.onClick) {
      n.onclick = () => options.onClick?.();
    }

    if (options.duration && options.duration > 0 && !options.requireInteraction) {
      setTimeout(() => {
        n.close();
      }, options.duration * 1000);
    }
  }
}

/** 应用内通知提供者 */
export class AppNotificationProvider extends BaseNotificationProvider {
  constructor() {
    super('app');
  }

  protected doNotify(options: NoticeOptions): void {
    const type = options.type || 'info';
    // Ant Design Vue 的 notification API
    antNotification[type]({
      message: options.title,
      description: options.body,
      duration: options.duration === undefined ? 4.5 : options.duration,
      onClick: options.onClick
    });
  }
}

/** 通知管理器 */
export class NotificationManager {
  private providers: NotificationProvider[] = [];

  constructor() {
    // 默认注册应用内通知
    this.registerProvider(new AppNotificationProvider());
    // 默认注册桌面通知
    this.registerProvider(new DesktopNotificationProvider());
  }

  /**
   * 注册通知提供者
   * @param provider 实现 NotificationProvider 接口的对象
   */
  registerProvider(provider: NotificationProvider) {
    // 避免重复注册同名 provider
    if (!this.providers.find(p => p.name === provider.name)) {
      this.providers.push(provider);
    }
  }

  /**
   * 移除通知提供者
   * @param name provider 名称
   */
  removeProvider(name: string) {
    this.providers = this.providers.filter(p => p.name !== name);
  }

  /**
   * 发送通知
   * @param options 通知选项
   * @param targets 指定发送的目标 provider 名称列表，如果不传则发送给所有已注册的 provider
   */
  async send(options: NoticeOptions, targets?: string[]) {
    const providersToNotify = targets ? this.providers.filter(p => targets.includes(p.name)) : this.providers;

    // 并行发送
    await Promise.all(
      providersToNotify.map(p => {
        try {
          return p.notify(options);
        } catch (error) {
          console.error(`[NotificationManager] Provider ${p.name} failed:`, error);
        }
      })
    );
  }
}

// 导出单例
export const notice = new NotificationManager();
