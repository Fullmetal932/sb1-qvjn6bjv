
import { logger } from '../utils/logger';

export abstract class CoreService {
  private static instances: Map<string, any> = new Map();

  protected constructor() {}

  protected static getInstance<T extends CoreService>(this: new () => T): T {
    const name = this.name;
    if (!CoreService.instances.has(name)) {
      CoreService.instances.set(name, new this());
    }
    return CoreService.instances.get(name);
  }

  protected logError(error: unknown, context?: string) {
    logger.error(`${context || this.constructor.name} error:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
