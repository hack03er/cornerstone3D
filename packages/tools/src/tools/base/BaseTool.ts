import { utilities, BaseVolumeViewport } from '@cornerstonejs/core';
import { Types } from '@cornerstonejs/core';
import ToolModes from '../../enums/ToolModes';
import StrategyCallbacks from '../../enums/StrategyCallbacks';
import { InteractionTypes, ToolProps, PublicToolProps } from '../../types';
import { getVolumeId } from '../../utilities/getVolumeId';

const { DefaultHistoryMemo } = utilities.HistoryMemo;

export interface IBaseTool {
  /** ToolGroup ID the tool instance belongs to */
  toolGroupId: string;
  /** Tool supported interaction types */
  supportedInteractionTypes: InteractionTypes[];
  /** Tool Mode : Active, Passive, Enabled, Disabled */
  mode: ToolModes;
  /** Tool Configuration */
  configuration: {
    preventHandleOutsideImage?: boolean;
    strategies?: Record<string, any>;
    defaultStrategy?: string;
    activeStrategy?: string;
    strategyOptions?: Record<string, unknown>;
  };
}

/**
 * Abstract base class from which all tools derive.
 * Deals with cleanly merging custom and default configuration, and strategy
 * application.
 */
abstract class BaseTool implements IBaseTool {
  static toolName;
  /** Supported Interaction Types - currently only Mouse */
  public supportedInteractionTypes: InteractionTypes[];
  public configuration: Record<string, any>;
  /** ToolGroup ID the tool instance belongs to */
  public toolGroupId: string;
  /** Tool Mode - Active/Passive/Enabled/Disabled/ */
  public mode: ToolModes;
  /**
   * A memo recording the starting state of a tool.  This will be updated
   * as changes are made, and reflects the fact that a memo has been created.
   */
  protected memo: utilities.HistoryMemo.Memo;

  constructor(toolProps: PublicToolProps, defaultToolProps: ToolProps) {
    const initialProps = utilities.deepMerge(defaultToolProps, toolProps);

    const {
      configuration = {},
      supportedInteractionTypes,
      toolGroupId,
    } = initialProps;

    // If strategies are not initialized in the tool config
    if (!configuration.strategies) {
      configuration.strategies = {};
      configuration.defaultStrategy = undefined;
      configuration.activeStrategy = undefined;
      configuration.strategyOptions = {};
    }

    this.toolGroupId = toolGroupId;
    this.supportedInteractionTypes = supportedInteractionTypes || [];
    this.configuration = Object.assign({}, configuration);
    this.mode = ToolModes.Disabled;
  }

  /**
   * Returns the name of the tool
   * @returns The name of the tool.
   */
  public getToolName(): string {
    // Since toolName is static we get it from the class constructor
    return (<typeof BaseTool>this.constructor).toolName;
  }

  /**
   * Applies the active strategy function to the enabled element with the specified
   * operation data.
   * @param enabledElement - The element that is being operated on.
   * @param operationData - The data that needs to be passed to the strategy.
   * @returns The result of the strategy.
   */
  public applyActiveStrategy(
    enabledElement: Types.IEnabledElement,
    operationData: unknown
  ): any {
    const { strategies, activeStrategy } = this.configuration;
    return strategies[activeStrategy]?.call(
      this,
      enabledElement,
      operationData
    );
  }

  /**
   * Applies the active strategy, with a given event type being applied.
   * The event type function is found by indexing it on the active strategy
   * function.
   *
   * @param enabledElement - The element that is being operated on.
   * @param operationData - The data that needs to be passed to the strategy.
   * @param callbackType - the type of the callback
   *
   * @returns The result of the strategy.
   */
  public applyActiveStrategyCallback(
    enabledElement: Types.IEnabledElement,
    operationData: unknown,
    callbackType: StrategyCallbacks | string,
    ...extraArgs
  ) {
    const { strategies, activeStrategy } = this.configuration;

    if (!strategies[activeStrategy]) {
      throw new Error(
        `applyActiveStrategyCallback: active strategy ${activeStrategy} not found, check tool configuration or spellings`
      );
    }

    return strategies[activeStrategy][callbackType]?.call(
      this,
      enabledElement,
      operationData,
      ...extraArgs
    );
  }

  /**
   * merges the new configuration with the tool configuration
   * @param configuration - toolConfiguration
   */
  public setConfiguration(newConfiguration: Record<string, any>): void {
    this.configuration = utilities.deepMerge(
      this.configuration,
      newConfiguration
    );
  }

  /**
   * Sets the active strategy for a tool. Strategies are
   * multiple implementations of tool behavior that can be switched by tool
   * configuration.
   *
   * @param strategyName - name of the strategy to be set as active
   */
  public setActiveStrategy(strategyName: string): void {
    this.setConfiguration({ activeStrategy: strategyName });
  }

  /**
   * Returns the volumeId for the volume viewport. It will grabbed the volumeId
   * from the volumeId if particularly specified in the tool configuration, or if
   * not, the first actorUID in the viewport is returned as the volumeId. NOTE: for
   * segmentations, actorUID is not necessarily the volumeId since the segmentation
   * can have multiple representations, use segmentation helpers to get the volumeId
   * based on the actorUID.
   *
   * @param viewport - Volume viewport
   * @returns the volumeId for the viewport if specified in the tool configuration,
   * or the first actorUID in the viewport if not.
   */
  private getTargetVolumeId(viewport: Types.IViewport): string | undefined {
    if (this.configuration.volumeId) {
      return this.configuration.volumeId;
    }

    // If volume not specified, then return the actorUID for the
    // default actor - first actor
    const actorEntries = viewport.getActors();

    if (!actorEntries) {
      return;
    }

    // find the first image actor of instance type vtkVolume
    return actorEntries.find(
      (actorEntry) => actorEntry.actor.getClassName() === 'vtkVolume'
    )?.uid;
  }

  /**
   * Get the image that is displayed for the targetId in the cachedStats
   * which can be
   * * imageId:<imageId>
   * * volumeId:<volumeId>
   * * videoId:<basePathForVideo>/frames/<frameSpecifier>
   *
   * @param targetId - annotation targetId stored in the cached stats
   * @param renderingEngine - The rendering engine
   * @returns The image data for the target.
   */
  protected getTargetIdImage(
    targetId: string,
    renderingEngine: Types.IRenderingEngine
  ): Types.IImageData | Types.CPUIImageData | Types.IImageVolume {
    if (targetId.startsWith('imageId:')) {
      const imageId = targetId.split('imageId:')[1];
      const imageURI = utilities.imageIdToURI(imageId);
      let viewports = utilities.getViewportsWithImageURI(
        imageURI,
        renderingEngine.id
      );

      if (!viewports || !viewports.length) {
        return;
      }

      viewports = viewports.filter((viewport) => {
        return viewport.getCurrentImageId() === imageId;
      });

      if (!viewports || !viewports.length) {
        return;
      }

      return viewports[0].getImageData();
    } else if (targetId.startsWith('volumeId:')) {
      const volumeId = getVolumeId(targetId);
      const viewports = utilities.getViewportsWithVolumeId(
        volumeId,
        renderingEngine.id
      );

      if (!viewports || !viewports.length) {
        return;
      }

      return viewports[0].getImageData();
    } else if (targetId.startsWith('videoId:')) {
      // Video id can be multi-valued for the frame information
      const imageURI = utilities.imageIdToURI(targetId);
      const viewports = utilities.getViewportsWithImageURI(
        imageURI,
        renderingEngine.id
      );

      if (!viewports || !viewports.length) {
        return;
      }

      return viewports[0].getImageData();
    } else {
      throw new Error(
        'getTargetIdImage: targetId must start with "imageId:" or "volumeId:"'
      );
    }
  }

  /**
   * Get the target Id for the viewport which will be used to store the cached
   * statistics scoped to that target in the annotations.
   * For StackViewport, targetId is the viewportId, but for the volume viewport,
   * the targetId will be grabbed from the volumeId if particularly specified
   * in the tool configuration, or if not, the first actorUID in the viewport.
   *
   * @param viewport - viewport to get the targetId for
   * @returns targetId
   */
  protected getTargetId(viewport: Types.IViewport): string | undefined {
    const targetId = viewport.getReferenceId?.();
    if (targetId) {
      return targetId;
    }
    if (viewport instanceof BaseVolumeViewport) {
      return `volumeId:${this.getTargetVolumeId(viewport)}`;
    }
    throw new Error('getTargetId: viewport must have a getTargetId method');
  }

  /**
   * Undo an action
   */
  public undo() {
    DefaultHistoryMemo.undo();
    this.memo = null;
  }

  /**
   * Redo an action (undo the undo)
   */
  public redo() {
    DefaultHistoryMemo.redo();
  }

  public static createZoomPanMemo(viewport) {
    // TODO - move this to view callback as a utility
    const state = {
      pan: viewport.getPan(),
      zoom: viewport.getZoom(),
    };
    const zoomPanMemo = {
      restoreMemo: () => {
        const currentPan = viewport.getPan();
        const currentZoom = viewport.getZoom();
        viewport.setZoom(state.zoom);
        viewport.setPan(state.pan);
        viewport.render();
        state.pan = currentPan;
        state.zoom = currentZoom;
      },
    };
    DefaultHistoryMemo.push(zoomPanMemo);
    return zoomPanMemo;
  }

  /**
   * Clear the memo by default.
   */
  public preMouseDownCallback = (_evt): boolean => {
    console.log('***** Clearing memo');
    this.memo = null;
    return false;
  };
}

// Note: this is a workaround since terser plugin does not support static blocks
// yet and we can't easily say static toolName = "BaseTool" in the class definition.
BaseTool.toolName = 'BaseTool';
export default BaseTool;
