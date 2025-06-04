
import { Message, createMessage, createMessageFromFNode } from './message.js';
import { Context, createContext, BranchState } from './context.js';
import { FNode, FNodeType, createFNode } from './fnode.js';
import { Adapter, isAdapter } from './adapter.js';
import { Configuration, ConfigurationManager, ExtensionConfig } from './configuration.js';
import { ResourceManager } from './resource-manager.js';
import { LoggerFactory } from './logger.js';

/**
 * Unified pipeline hook interface
 */
export interface PipelineHook {
  before?: (message: Message | null) => Message | null | void;
  after?: (result: Message | any) => Message | any | void;
}

/**
 * Main PipeFitter fluent API class
 */
export class PipeFitter {
  private message: Message | null = null;
  private context: Context;

  constructor(userConfig: Partial<Configuration> = {}) {
    const config = ConfigurationManager.create(userConfig);
    const logger = LoggerFactory.create();
    const resources = new ResourceManager();

    LoggerFactory.setLevel(config.logLevel);
    this.context = createContext(logger, config, resources);
  }

  from(source: FNode | Adapter, options?: any, hooks?: PipelineHook): PipeFitter {
    let initialMessage: Message | null = null;
    if (hooks?.before) {
      const beforeResult = hooks.before(null);
      if (beforeResult) {
        initialMessage = beforeResult;
      }
    }

    if (isAdapter(source)) {
      this.context.resources.registerAdapter(source);
      const inputMessage = initialMessage || createMessage(this.context);
      this.message = source.handle(inputMessage, options);
    } else {
      this.message = initialMessage || createMessageFromFNode(source, this.context);
    }

    if (hooks?.after && this.message) {
      const afterResult = hooks.after(this.message);
      if (afterResult) {
        this.message = afterResult;
      }
    }

    return this;
  }

  to<T = any>(target: Adapter, options?: any, hooks?: PipelineHook): T | Promise<T> {
    this.validateSource();

    this.context.resources.registerAdapter(target);

    let currentMessage = this.message!;
    if (hooks?.before) {
      const beforeResult = hooks.before(currentMessage);
      if (beforeResult) currentMessage = beforeResult;
    }

    let result = target.handle(currentMessage, options);

    if (hooks?.after) {
      const afterResult = hooks.after(result);
      if (afterResult !== undefined) {
        result = afterResult;
      }
    }

    return result;
  }

  map(fn: (msg: Message) => Message, hooks?: PipelineHook): PipeFitter {
    this.validateSource();

    if (hooks?.before) {
      const beforeResult = hooks.before(this.message);
      if (beforeResult) this.message = beforeResult;
    }

    this.message = fn(this.message!);

    if (hooks?.after) {
      const afterResult = hooks.after(this.message);
      if (afterResult) this.message = afterResult;
    }

    return this;
  }

  filter(predicate: (msg: Message) => boolean, hooks?: PipelineHook): PipeFitter {
    this.validateSource();

    if (hooks?.before) {
      const beforeResult = hooks.before(this.message);
      if (beforeResult) this.message = beforeResult;
    }

    if (!predicate(this.message!)) {
      this.message = {
        ...this.message!,
        data: createFNode(FNodeType.VALUE, 'filtered', null)
      };
    }

    if (hooks?.after) {
      const afterResult = hooks.after(this.message);
      if (afterResult) this.message = afterResult;
    }

    return this;
  }

  find(predicate: (msg: Message) => boolean, hooks?: PipelineHook): PipeFitter {
    return this.map(msg => {
      if (msg.data.children && msg.data.children.length > 0) {
        const found = msg.data.children.find(child => {
          const childMsg = { ...msg, data: child };
          return predicate(childMsg);
        });
        return {
          ...msg,
          data: found || createFNode(FNodeType.VALUE, 'notfound', null)
        };
      } else {
        return predicate(msg) ? msg : {
          ...msg,
          data: createFNode(FNodeType.VALUE, 'notfound', null)
        };
      }
    }, hooks);
  }

  branch(predicate: (msg: Message) => boolean, hooks?: PipelineHook): PipeFitter {
    this.validateSource();

    let currentMessage = this.message!;
    if (hooks?.before) {
      const beforeResult = hooks.before(currentMessage);
      if (beforeResult) currentMessage = beforeResult;
    }

    const branchPipeline = new PipeFitter();
    branchPipeline.context = { ...this.context };

    const branchState: BranchState = {
      parentMessage: currentMessage,
      predicate
    };

    branchPipeline.message = {
      ...currentMessage,
      context: {
        ...currentMessage.context,
        branchState
      }
    };

    if (hooks?.after && branchPipeline.message) {
      const afterResult = hooks.after(branchPipeline.message);
      if (afterResult) {
        branchPipeline.message = afterResult;
      }
    }

    return branchPipeline;
  }

  merge(strategy: (branch: Message, parent: Message) => Message, hooks?: PipelineHook): PipeFitter {
    if (!this.message?.context.branchState) {
      throw new Error("No active branch to merge");
    }

    let branchMessage = this.message;
    let parentMessage = this.message.context.branchState.parentMessage;

    if (hooks?.before) {
      const result = hooks.before(branchMessage);
      if (result) branchMessage = result;
    }

    this.message = strategy(branchMessage, parentMessage);
    this.message.context.branchState = undefined;

    if (hooks?.after) {
      const afterResult = hooks.after(this.message);
      if (afterResult) this.message = afterResult;
    }

    return this;
  }

  async startAdapters(): Promise<void> {
    await this.context.resources.startAll();
  }

  async cleanup(): Promise<void> {
    await this.context.resources.cleanup();
  }

  registerCleanup(callback: () => void | Promise<void>): void {
    this.context.resources.registerCleanup(callback);
  }

  static registerMethod(
    name: string,
    method: Function,
    extensionConfig?: ExtensionConfig
  ): void {
    if (extensionConfig) {
      ConfigurationManager.mergeExtensionDefaults(extensionConfig);
    }
    (PipeFitter.prototype as any)[name] = method;
  }

  private validateSource(): void {
    if (!this.message) {
      throw new Error('No source set: call from() before transformation');
    }
  }
}
