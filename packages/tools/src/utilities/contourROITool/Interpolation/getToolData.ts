import { Types } from '@cornerstonejs/core';
import { InterpolationROIAnnotation } from '../../../types/ToolSpecificAnnotationTypes';

export default function getToolData(eventData, points, referencedToolData) {
  const { viewport } = eventData;
  const camera = viewport.getCamera();
  const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
  const { viewPlaneNormal, viewUp } = camera;

  const annotation: InterpolationROIAnnotation = {
    highlighted: false,
    interpolationUID: referencedToolData.interpolationUID,
    invalidated: true,
    autoGenerated: true,
    metadata: {
      viewPlaneNormal: [...viewPlaneNormal] as Types.Point3,
      viewUp: [...viewUp] as Types.Point3,
      FrameOfReferenceUID,
      referencedImageId: undefined,
      toolName: eventData.toolName,
    },
    data: {
      handles: {
        points: [],
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
        polyline: [], // Polyline coordinates
        closed: true,
      },
      label: referencedToolData.data.label,
      cachedStats: {},
    },
  };

  const { polyline } = annotation.data.contour;
  for (let i = 0; i < points.length; i++) {
    polyline.push([points[i][0], points[i][1], points[i][2]]);
  }
  console.log('Updated annotation', polyline.length, annotation);
  return annotation;
}
