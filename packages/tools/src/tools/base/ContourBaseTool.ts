import { getEnabledElement } from '@cornerstonejs/core';
import type { Types } from '@cornerstonejs/core';
import {
  addAnnotation,
  getAnnotations,
  getChildAnnotations,
} from '../../stateManagement/annotation/annotationState';
import type {
  Annotation,
  ContourAnnotation,
  EventTypes,
  PublicToolProps,
  ToolProps,
  SVGDrawingHelper,
  AnnotationRenderContext,
} from '../../types';
import { drawPath as drawPathSvg } from '../../drawingSvg';
import { StyleSpecifier } from '../../types/AnnotationStyle';
import AnnotationTool from './AnnotationTool';
import { updateContourPolyline } from '../../utilities/contours/';
import { getContourHolesDataCanvas } from '../../utilities/contours';
import { ContourWindingDirection } from '../../types/ContourAnnotation';

/**
 * A contour base class responsible for rendering contour instances such as
 * spline, freehand and livewire.
 */
abstract class ContourBaseTool extends AnnotationTool {
  constructor(toolProps: PublicToolProps, defaultToolProps: ToolProps) {
    super(toolProps, defaultToolProps);
  }

  /**
   * it is used to draw the annotation in each request animation frame. It
   * calculates the updated cached statistics if data is invalidated and cache it.
   * @param enabledElement - The Cornerstone's enabledElement.
   * @param svgDrawingHelper - The svgDrawingHelper providing the context for drawing.
   */
  public renderAnnotation(
    enabledElement: Types.IEnabledElement,
    svgDrawingHelper: SVGDrawingHelper
  ): boolean {
    let renderStatus = false;
    const { viewport } = enabledElement;
    const { element } = viewport;

    // If rendering engine has been destroyed while rendering
    if (!viewport.getRenderingEngine()) {
      console.warn('Rendering Engine has been destroyed');
      return renderStatus;
    }

    let annotations = getAnnotations(this.getToolName(), element);

    if (!annotations?.length) {
      return renderStatus;
    }

    annotations = this.filterInteractableAnnotationsForElement(
      element,
      annotations
    );

    if (!annotations?.length) {
      return renderStatus;
    }

    const targetId = this.getTargetId(viewport);
    const styleSpecifier: StyleSpecifier = {
      toolGroupId: this.toolGroupId,
      toolName: this.getToolName(),
      viewportId: enabledElement.viewport.id,
    };

    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i] as Annotation;

      styleSpecifier.annotationUID = annotation.annotationUID;

      const annotationStyle = this.getAnnotationStyle({
        annotation,
        styleSpecifier,
      });

      if (!annotationStyle.visibility) {
        continue;
      }

      const annotationRendered = this.renderAnnotationInstance({
        enabledElement,
        targetId,
        annotation,
        annotationStyle,
        svgDrawingHelper,
      });

      renderStatus ||= annotationRendered;
      annotation.invalidated = false;
    }

    return renderStatus;
  }

  protected createAnnotation(evt: EventTypes.InteractionEventType): Annotation {
    const eventDetail = evt.detail;
    const { currentPoints, element } = eventDetail;
    const { world: worldPos } = currentPoints;

    const enabledElement = getEnabledElement(element);
    const { viewport } = enabledElement;

    const camera = viewport.getCamera();
    const { viewPlaneNormal, viewUp, position: cameraPosition } = camera;

    const referencedImageId = this.getReferencedImageId(
      viewport,
      worldPos,
      viewPlaneNormal,
      viewUp
    );

    const viewReference = viewport.getViewReference({ points: [worldPos] });

    return <ContourAnnotation>{
      highlighted: true,
      invalidated: true,
      metadata: {
        toolName: this.getToolName(),
        ...viewReference,
        referencedImageId,
        viewUp,
        cameraPosition,
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
          polyline: [],
          closed: false,
        },
      },
      interpolationUID: '',
      autoGenerated: false,
    };
  }

  /**
   * Add the annotation to the annotation manager.
   * @param annotation - Contour annotation that is being added
   * @param element - HTMLDivElement
   */
  protected addAnnotation(
    annotation: Annotation,
    element: HTMLDivElement
  ): string {
    // Just to give a chance for child classes to override it
    return addAnnotation(annotation, element);
  }

  /**
   * Cancel an annotation when drawing.
   * @param annotation - Contour annotation that is being added
   * @param element - HTMLDivElement
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected cancelAnnotation(annotation: Annotation): void {
    // noop method just to give a chance for child classes to override it
  }

  /**
   * Move an annotation and all its child annotations in a recursive way.
   *
   * That is useful when clicking on a spline contour to completely translate
   * it to a different place. In that case all holes (child annotations) must
   * also be translated too.
   *
   * @param annotation - Annotation
   * @param worldPosDelta - Delta in world space
   */
  protected moveAnnotation(
    annotation: Annotation,
    worldPosDelta: Types.Point3
  ): void {
    const { points } = annotation.data.handles;

    for (let i = 0, numPoints = points.length; i < numPoints; i++) {
      const point = points[i];

      point[0] += worldPosDelta[0];
      point[1] += worldPosDelta[1];
      point[2] += worldPosDelta[2];
    }

    annotation.invalidated = true;

    getChildAnnotations(annotation).forEach((childAnnotation) =>
      this.moveAnnotation(childAnnotation, worldPosDelta)
    );
  }

  protected updateContourPolyline(
    annotation: ContourAnnotation,
    polylineData: {
      points: Types.Point2[];
      closed?: boolean;
      targetWindingDirection?: ContourWindingDirection;
    },
    transforms: {
      canvasToWorld: (point: Types.Point2) => Types.Point3;
      worldToCanvas: (point: Types.Point3) => Types.Point2;
    }
  ) {
    const decimateConfig = this.configuration?.decimate || {};

    updateContourPolyline(annotation, polylineData, transforms, {
      decimate: {
        enabled: !!decimateConfig.enabled,
        epsilon: decimateConfig.epsilon,
      },
    });
  }

  /**
   * Get polyline points in world space.
   * Just to give a chance for child classes to override it.
   * @param annotation - Contour annotation
   * @returns Polyline points in world space
   */
  protected getPolylinePoints(annotation: ContourAnnotation): Types.Point3[] {
    // Attention: `contour.polyline` is the new way to store a polyline but it
    // may be undefined because it was `data.polyline` before (fallback)
    return annotation.data.contour?.polyline ?? annotation.data.polyline;
  }

  /**
   * Render a contour segmentation instance
   */
  protected renderAnnotationInstance(
    renderContext: AnnotationRenderContext
  ): boolean {
    const { enabledElement, annotationStyle, svgDrawingHelper } = renderContext;
    const annotation = renderContext.annotation as ContourAnnotation;

    // Do not render the contour because it must be rendered by the parent annotation
    if (annotation.parentAnnotationUID) {
      return;
    }

    const { annotationUID } = annotation;
    const { viewport } = enabledElement;
    const { worldToCanvas } = viewport;
    const polylineCanvasPoints = this.getPolylinePoints(annotation).map(
      (point) => worldToCanvas(point)
    );
    const { lineWidth, lineDash, color, fillColor, fillOpacity } =
      annotationStyle;

    const childContours = getContourHolesDataCanvas(annotation, viewport);
    const allContours = [polylineCanvasPoints, ...childContours];

    drawPathSvg(
      svgDrawingHelper,
      annotationUID,
      'contourPolyline',
      allContours,
      {
        color,
        lineDash,
        lineWidth: Math.max(0.1, lineWidth),
        fillColor: fillColor,
        fillOpacity,
      }
    );

    return true;
  }
}

export { ContourBaseTool as default, ContourBaseTool };
