import { Types, utilities as csUtils } from '@cornerstonejs/core';
import { InterpolationROIAnnotation } from '../../../types/ToolSpecificAnnotationTypes.js';

/**
 * Creates a new annotation instance given the tool data, based on the referenced tool
 * data type.
 * Note that this object takes ownership of the polyline and handlePoints data, that is,
 * directly assigns them internally to the result.
 *
 * @param polyline - data for the polyline, owned hereafter by the annotation
 * @param handlePoints - data for the edit handles, if any, owned hereafter by the annotation
 * @param referencedToolData - for base data for the new tool

 */
export default function createPolylineToolData(
  polyline,
  handlePoints,
  referencedToolData
) {
  const annotation: InterpolationROIAnnotation = csUtils.deepMerge(
    {
      data: {},
      metadata: {},
    },
    referencedToolData
  );
  Object.assign(annotation, {
    highlighted: false,
    invalidated: true,
    autoGenerated: true,
    annotationUID: undefined,
    cachedStats: {},
    childAnnotationUIDs: [],
    parentAnnotationUID: undefined,
  });
  Object.assign(annotation.data, {
    handles: {
      points: handlePoints.points || handlePoints || [],
      /**
       * The interpolation sources contains the source points used for interpolating
       * to generate the new handles.  This allows performing other types of
       * interpolation to generate the new handles, such as livewire.
       */
      interpolationSources: handlePoints.sources,
      activeHandleIndex: null,
      textBox: {
        hasMoved: false,
        worldPosition: <Types.Point3>[0, 0, 0],
        worldBoundingBox: {
          topLeft: <Types.Point3>[0, 0, 0],
          topRight: <Types.Point3>[0, 0, 0],
          bottomLeft: <Types.Point3>[0, 0, 0],
          bottomRight: <Types.Point3>[0, 0, 0],
        },
      },
    },
    contour: {
      ...referencedToolData.data.contour,
      polyline,
    },
  });

  return annotation;
}
