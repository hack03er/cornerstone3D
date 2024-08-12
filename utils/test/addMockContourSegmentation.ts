import { utilities as csUtils } from '../../packages/core/src/index';
import {
  annotation,
  utilities as cstUtils,
} from '../../packages/tools/src/index';

export function addMockContourSegmentation({
  segmentationId,
  contours,
  viewport,
}) {
  contours = Array.isArray(contours) ? contours : [contours];
  contours.forEach((contour) => {
    const {
      segmentIndex = 1,
      radius = 100,
      resolution = 100,
      centerOffset = [0, 0],
    } = contour;

    // get the circle annotation that would draw if we pick the center
    // as the circle center and the radius as the distance from the center
    // to the edge of the viewport

    const centerInCanvas = [
      viewport.canvas.width / 2 + centerOffset[0],
      viewport.canvas.height / 2 + centerOffset[1],
    ];
    const radiusInCanvas = radius;

    const polyline = Array.from(Array(resolution).keys()).map((i) => {
      const angle = (i * 2 * Math.PI) / resolution;
      const x = centerInCanvas[0] + radiusInCanvas * Math.cos(angle);
      const y = centerInCanvas[1] + radiusInCanvas * Math.sin(angle);

      const world = viewport.canvasToWorld([
        x / window?.devicePixelRatio || 1,
        y / window?.devicePixelRatio || 1,
      ]);

      return world;
    });

    const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
    const camera = viewport.getCamera();
    const contourSegmentationAnnotation = {
      annotationUID: csUtils.uuidv4(),
      data: {
        contour: {
          closed: true,
          polyline,
        },
        segmentation: {
          segmentationId,
          segmentIndex,
        },
        handles: {},
      },
      handles: {},
      highlighted: false,
      autoGenerated: false,
      invalidated: false,
      isLocked: false,
      isVisible: true,
      metadata: {
        referencedImageId: viewport.getCurrentImageId(),
        toolName: 'PlanarFreehandContourSegmentationTool',
        FrameOfReferenceUID: FrameOfReferenceUID,
        viewPlaneNormal: camera.viewPlaneNormal,
      },
    };

    const annotationGroupSelector = viewport.element;

    annotation.state.addAnnotation(
      contourSegmentationAnnotation,
      annotationGroupSelector
    );

    cstUtils.contourSegmentation.addContourSegmentationAnnotation(
      contourSegmentationAnnotation
    );

    cstUtils.triggerAnnotationRenderForViewportIds(
      viewport.getRenderingEngine(),
      [viewport.id]
    );
  });
}
