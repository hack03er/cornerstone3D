import FrameOfReferenceSpecificAnnotationManager, {
  defaultFrameOfReferenceSpecificAnnotationManager,
} from './annotation/FrameOfReferenceSpecificAnnotationManager';
import * as annotationLocking from './annotation/annotationLocking';
import * as annotationSelection from './annotation/annotationSelection';

import {
  getAnnotations,
  addAnnotation,
  removeAnnotation,
  getAnnotation,
  getParentAnnotation,
  getChildAnnotations,
  clearParentAnnotation,
  addChildAnnotation,
  getNumberOfAnnotations,
  setAnnotationManager,
  getAnnotationManager,
  resetAnnotationManager,
  invalidateAnnotation,
} from './annotation/annotationState';

import {
  addSegmentationRepresentations,
  addSegmentationRepresentationsMap,
} from './segmentation/addSegmentationRepresentations';
import removeSegmentationRepresentations from './segmentation/removeSegmentationRepresentations';

export {
  // annotations
  FrameOfReferenceSpecificAnnotationManager,
  defaultFrameOfReferenceSpecificAnnotationManager,
  annotationLocking,
  annotationSelection,
  getAnnotations,
  addAnnotation,
  getNumberOfAnnotations,
  removeAnnotation,
  getAnnotation,
  getParentAnnotation,
  getChildAnnotations,
  clearParentAnnotation,
  addChildAnnotation,
  setAnnotationManager,
  getAnnotationManager,
  resetAnnotationManager,
  invalidateAnnotation,
  // segmentations
  addSegmentationRepresentations,
  addSegmentationRepresentationsMap,
  removeSegmentationRepresentations,
};
