import type {
  IViewport,
  IStackViewport,
  IVolumeViewport,
} from '../types/index.js';
import cache from '../cache/index.js';

function getViewportModality(viewport: IViewport, volumeId?: string): string {
  if ((viewport as IStackViewport).modality) {
    return (viewport as IStackViewport).modality;
  }

  if ((viewport as IVolumeViewport).setVolumes) {
    volumeId = volumeId ?? viewport.getDefaultActor()?.uid;

    if (!volumeId) {
      return;
    }

    return cache.getVolume(volumeId)?.metadata.Modality;
  }

  throw new Error('Invalid viewport type');
}

export { getViewportModality as default, getViewportModality };
