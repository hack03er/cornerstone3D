import cloneDeep from 'lodash.clonedeep';
import {
  Annotation,
  Annotations,
  AnnotationState,
  GroupSpecificAnnotations,
} from '../../types/AnnotationTypes';

import { IAnnotationManager } from '../../types';

import {
  Enums,
  eventTarget,
  getEnabledElement,
  Types,
  utilities,
} from '@cornerstonejs/core';

import { checkAndDefineIsLockedProperty } from './annotationLocking';
import { checkAndDefineIsVisibleProperty } from './annotationVisibility';

/**
 * This is the default annotation manager. It stores annotations by default
 * based on the FrameOfReferenceUID. However, it is possible to override the
 * getAnnotationStateKey function to store annotations based on any other
 * property of the element. When you write your custom annotation manager, you
 * can use the setAnnotationManager function to set your custom annotation.
 *
 * Note that this class is a singleton and should not be instantiated directly.
 * To get the stored annotations information you can use ToolState helpers.
 */
class FrameOfReferenceSpecificAnnotationManager implements IAnnotationManager {
  private annotations: AnnotationState;
  public readonly uid: string;

  /**
   * @param uid - The uid of the state manager. If omitted it is autogenerated.
   */
  constructor(uid?: string) {
    if (!uid) {
      uid = utilities.uuidv4();
    }
    this.annotations = {};
    this.uid = uid;

    // Listen to the IMAGE_VOLUME_MODIFIED event to invalidate data.
    eventTarget.addEventListener(
      Enums.Events.IMAGE_VOLUME_MODIFIED,
      this._imageVolumeModifiedHandler
    );
  }

  /**
   * Default annotation manager works with FrameOfReferenceUID as the key. The
   * manager adds them under the FrameOfReferenceUID for the element being
   * annotated.
   *
   * @param element - The element to get the annotation state key for.
   * @returns - The annotation state key for the element.
   */
  getGroupKey = (element: HTMLDivElement): string => {
    const enabledElement = getEnabledElement(element);

    // Todo: What to do if no enabled element? Throw error? but it means usage of
    // annotation manager is bound to an enabled element, which is not the case
    // which should not be the case, since hydration of annotations can happen
    // sooner than the element is enabled. Maybe we can subscribe to the
    // ENABLE_ELEMENT event and then hydrate the annotations after if not enabled
    // yet?
    return enabledElement.FrameOfReferenceUID;
  };

  /**
   * When a volume is modified we invalidate all of the `annotations` on the
   * volume's `FrameOfReferenceUID`. This is mainly to update statistics calculations
   * when an annotation is drawn whilst data is still loading.
   *
   * @param evt - The IMAGE_VOLUME_MODIFIED rendering event.
   */
  _imageVolumeModifiedHandler = (
    evt: Types.EventTypes.ImageVolumeModifiedEvent
  ) => {
    const eventDetail = evt.detail;
    const { FrameOfReferenceUID } = eventDetail;

    const annotations = this.annotations;
    const frameOfReferenceSpecificAnnotations =
      annotations[FrameOfReferenceUID];

    if (!frameOfReferenceSpecificAnnotations) {
      return;
    }

    Object.keys(frameOfReferenceSpecificAnnotations).forEach((toolName) => {
      const toolSpecificAnnotations =
        frameOfReferenceSpecificAnnotations[toolName];

      toolSpecificAnnotations.forEach((annotation) => {
        const invalidated = annotation.invalidated;

        if (invalidated !== undefined) {
          annotation.invalidated = true;
        }
      });
    });
  };

  /**
   * Returns all the available frameOfReferences inside the state manager
   * @returns - All the registered frame of references inside the manager
   */
  getFramesOfReference = (): Array<string> => {
    return Object.keys(this.annotations);
  };

  /**
   * Returns the annotations associated with the specified group and tool, or
   * all annotations for the group if the tool name is not provided.
   *
   * @param groupKey - The group key to retrieve annotations for (e.g. FrameOfReferenceUID).
   * @param toolName - Optional. The name of the tool to retrieve annotations for.
   * @returns The annotations associated with the specified group and tool, or all annotations for the group if the tool name is not provided.
   */
  getAnnotations = (
    groupKey: string,
    toolName?: string
  ): GroupSpecificAnnotations | Annotations | undefined => {
    const annotations = this.annotations;

    if (!annotations[groupKey]) {
      return;
    }

    if (toolName) {
      return annotations[groupKey][toolName];
    }

    return annotations[groupKey];
  };

  /**
   * Given the unique identified for the some `annotation`, returns the `annotation`
   * from the `annotations`. Each `annotation` has a unique identifier.
   *
   * @param annotationUID - The unique identifier of the `annotation`.
   * @returns The retrieved `annotation`.
   */
  getAnnotation = (annotationUID: string): Annotation | undefined => {
    const annotations = this.annotations;

    for (const frameOfReferenceUID in annotations) {
      const frameOfReferenceAnnotations = annotations[frameOfReferenceUID];

      for (const toolName in frameOfReferenceAnnotations) {
        const toolSpecificAnnotations = frameOfReferenceAnnotations[toolName];

        for (const annotation of toolSpecificAnnotations) {
          if (annotationUID === annotation.annotationUID) {
            return annotation;
          }
        }
      }
    }
  };

  /**
   * A function that returns the number of annotations for a given tool in the
   * specific frame of reference. IF no frame of reference is provided, it will
   * return the number of annotations for the tool in all frames of references
   *
   * @param frameOfReferenceUID - The UID of the FrameOfReference to retrieve data for.
   * @param toolName - The name of the tool to retrieve data for.
   *
   * @returns The number of annotations for a given tool in the state
   */
  getNumberOfAnnotations = (groupKey: string, toolName?: string): number => {
    const annotations = this.getAnnotations(groupKey, toolName);

    if (!annotations) {
      return 0;
    }

    if (toolName) {
      return (annotations as Annotations).length;
    }

    let total = 0;

    for (const toolName in annotations) {
      total += annotations[toolName].length;
    }

    return total;
  };

  /**
   * Adds an instance of `Annotation` to the `annotations`.
   *
   * @param annotation - The annotation to add.
   */
  addAnnotation = (annotation: Annotation, groupKey?: string): void => {
    const { metadata } = annotation;
    const { FrameOfReferenceUID, toolName } = metadata;

    groupKey = groupKey || FrameOfReferenceUID;

    const annotations = this.annotations;

    let frameOfReferenceSpecificAnnotations = annotations[groupKey];

    if (!frameOfReferenceSpecificAnnotations) {
      annotations[groupKey] = {};

      frameOfReferenceSpecificAnnotations = annotations[groupKey];
    }

    let toolSpecificAnnotations = frameOfReferenceSpecificAnnotations[toolName];

    if (!toolSpecificAnnotations) {
      frameOfReferenceSpecificAnnotations[toolName] = [];

      toolSpecificAnnotations = frameOfReferenceSpecificAnnotations[toolName];
    }

    toolSpecificAnnotations.push(annotation);
    checkAndDefineIsLockedProperty(annotation);
    checkAndDefineIsVisibleProperty(annotation);
  };

  /**
   * Given the unique identified for the some `annotation`, removes the `annotation`
   * from the `annotations`. Searches are more efficient if either/both of
   * the `FrameOfReferenceUID` and the `toolName` are given by the `filter`.
   *
   * @param annotationUID - The unique identifier of the `annotation` to remove.
   * @param filter - A `filter` which reduces the scope of the search.
   */
  removeAnnotation = (annotationUID: string): void => {
    const { annotations } = this;

    for (const groupKey in annotations) {
      const groupAnnotations = annotations[groupKey];

      for (const toolName in groupAnnotations) {
        const toolAnnotations = groupAnnotations[toolName];

        const index = toolAnnotations.findIndex(
          (annotation) => annotation.annotationUID === annotationUID
        );

        if (index !== -1) {
          toolAnnotations.splice(index, 1);

          if (toolAnnotations.length === 0) {
            delete groupAnnotations[toolName];
          }
        }
      }

      if (Object.keys(groupAnnotations).length === 0) {
        delete annotations[groupKey];
      }
    }
  };

  /**
   * Removes all annotations associated with the specified group and tool, or
   * all annotations for the group if the tool name is not provided.
   *
   * @param groupKey - The group key to remove annotations for (e.g. FrameOfReferenceUID).
   * @param toolName - Optional. The name of the tool to remove annotations for.
   */
  removeAnnotations = (groupKey: string, toolName?: string): void => {
    const annotations = this.annotations;
    if (annotations[groupKey]) {
      if (toolName) {
        delete annotations[groupKey][toolName];
      } else {
        delete annotations[groupKey];
      }
    }
  };

  /**
   * Returns a section of the annotations. Useful for serialization.
   *
   * - If no arguments are given, the entire `AnnotationState` instance is returned.
   * - If the `FrameOfReferenceUID` is given, the corresponding
   * `FrameOfReferenceSpecificAnnotations` instance is returned.
   * - If both the `FrameOfReferenceUID` and the `toolName` are are given, the
   * corresponding `Annotations` instance is returned.
   *
   * @param FrameOfReferenceUID - A filter string for returning the `annotations` of a specific frame of reference.
   * @param toolName - A filter string for returning `annotations` for a specific tool on a specific frame of reference.
   *
   * @returns The retrieved `annotation`.
   */
  saveAnnotations = (
    FrameOfReferenceUID?: string,
    toolName?: string
  ): AnnotationState | GroupSpecificAnnotations | Annotations => {
    const annotations = this.annotations;

    if (FrameOfReferenceUID && toolName) {
      const frameOfReferenceSpecificAnnotations =
        annotations[FrameOfReferenceUID];

      if (!frameOfReferenceSpecificAnnotations) {
        return;
      }

      const toolSpecificAnnotations =
        frameOfReferenceSpecificAnnotations[toolName];

      return cloneDeep(toolSpecificAnnotations);
    } else if (FrameOfReferenceUID) {
      const frameOfReferenceSpecificAnnotations =
        annotations[FrameOfReferenceUID];

      return cloneDeep(frameOfReferenceSpecificAnnotations);
    }

    return cloneDeep(annotations);
  };

  /**
   * Restores a section of the `annotations`. Useful for loading in serialized data.
   *
   * - If no arguments are given, the entire `AnnotationState` instance is restored.
   * - If the `FrameOfReferenceUID` is given, the corresponding
   * `FrameOfReferenceSpecificAnnotations` instance is restored.
   * - If both the `FrameOfReferenceUID` and the `toolName` are are given, the
   * corresponding `Annotations` instance is restored.
   *
   * @param FrameOfReferenceUID - A filter string for restoring only the `annotations` of a specific frame of reference.
   * @param toolName - A filter string for restoring `annotation` for a specific tool on a specific frame of reference.
   */
  restoreAnnotations = (
    state: AnnotationState | GroupSpecificAnnotations | Annotations,
    FrameOfReferenceUID?: string,
    toolName?: string
  ): void => {
    const annotations = this.annotations;

    if (FrameOfReferenceUID && toolName) {
      // Set Annotations for FrameOfReferenceUID and toolName.

      let frameOfReferenceSpecificAnnotations =
        annotations[FrameOfReferenceUID];

      if (!frameOfReferenceSpecificAnnotations) {
        annotations[FrameOfReferenceUID] = {};

        frameOfReferenceSpecificAnnotations = annotations[FrameOfReferenceUID];
      }

      frameOfReferenceSpecificAnnotations[toolName] = <Annotations>state;
    } else if (FrameOfReferenceUID) {
      // Set FrameOfReferenceSpecificAnnotations for FrameOfReferenceUID.

      annotations[FrameOfReferenceUID] = <GroupSpecificAnnotations>state;
    } else {
      // Set entire annotations
      this.annotations = <AnnotationState>cloneDeep(state);
    }
  };

  /**
   * A function that returns the number of all annotations in the annotation state
   *
   * @returns The number of all annotations in the state
   */
  getNumberOfAllAnnotations = (): number => {
    let count = 0;
    const annotations = this.annotations;
    for (const groupKey in annotations) {
      const frameOfReferenceSpecificAnnotations = annotations[groupKey];
      for (const toolName in frameOfReferenceSpecificAnnotations) {
        const toolSpecificAnnotations =
          frameOfReferenceSpecificAnnotations[toolName];
        count += toolSpecificAnnotations.length;
      }
    }
    return count;
  };

  /**
   * Removes all annotations in the annotation state.
   */
  removeAllAnnotations = (): void => {
    this.annotations = {};
  };
}

export default FrameOfReferenceSpecificAnnotationManager;
