import { Types } from '@cornerstonejs/core';
import { Synchronizer } from '../store/index.js';

export default interface ISynchronizerEventHandler {
  (
    synchronizer: Synchronizer,
    sourceViewport: Types.IViewportId,
    targetViewport: Types.IViewportId,
    sourceEvent: any,
    options?: any
  ): Promise<void> | void;
}
