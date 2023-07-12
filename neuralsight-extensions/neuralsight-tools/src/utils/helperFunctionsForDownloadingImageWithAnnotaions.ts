import {
  Enums,
  getEnabledElement,
  getOrCreateCanvas,
  StackViewport,
  VolumeViewport,
} from '@cornerstonejs/core';
import { ToolGroupManager } from '@cornerstonejs/tools';

// Constants
const DEFAULT_SIZE = 512;
const MAX_TEXTURE_SIZE = 10000;
const VIEWPORT_ID = 'neuralsight-viewport-upload-form';

//TODO remove finally if this functions  not get used eventually especially with ai probing
/**
 *  Loads image from the active viewport to thew new viewport with this id  @constant VIEWPORT_ID or provided or new under @param viewportID and ready for download
 *
 *  */
const loadImage = (
  activeViewportElement,
  viewportElement,
  width,
  height,
  cornerstoneViewportService,
  viewportID = VIEWPORT_ID,
  maxTextureSize = MAX_TEXTURE_SIZE
) =>
  new Promise(resolve => {
    if (activeViewportElement && viewportElement) {
      const activeViewportEnabledElement = getEnabledElement(
        activeViewportElement
      );

      if (!activeViewportEnabledElement) {
        return;
      }

      const { viewport } = activeViewportEnabledElement;

      const renderingEngine = cornerstoneViewportService.getRenderingEngine();
      const uploadViewport = renderingEngine.getViewport(viewportID);

      if (uploadViewport instanceof StackViewport) {
        const imageId = viewport.getCurrentImageId();
        const properties = viewport.getProperties();
        //TODO: Not Sure where image comes from anyway will resolve it when using the function
        uploadViewport.setStack([imageId]).then(() => {
          uploadViewport.setProperties(properties);

          const newWidth = Math.min(width || image.width, maxTextureSize);
          const newHeight = Math.min(height || image.height, maxTextureSize);

          resolve({ width: newWidth, height: newHeight });
        });
      } else if (uploadViewport instanceof VolumeViewport) {
        const actors = viewport.getActors();
        // uploadViewport.setActors(actors);
        actors.forEach(actor => {
          uploadViewport.addActor(actor);
        });

        uploadViewport.setCamera(viewport.getCamera());
        uploadViewport.render();

        const newWidth = Math.min(width || image.width, maxTextureSize);
        const newHeight = Math.min(height || image.height, maxTextureSize);

        resolve({ width: newWidth, height: newHeight });
      }
    }
  });

const updateViewportPreview = (
  uploadViewportElement,
  internalCanvas,
  fileType,
  defaultSize = DEFAULT_SIZE
) =>
  new Promise(resolve => {
    //TODO correctly type this
    const enabledElement = getEnabledElement(uploadViewportElement) as any;

    const { viewport: uploadViewport, renderingEngine } = enabledElement;

    // Note: Since any trigger of dimensions will update the viewport,
    // we need to resize the offScreenCanvas to accommodate for the new
    // dimensions, this is due to the reason that we are using the GPU offScreenCanvas
    // to render the viewport for the uploadViewport.
    renderingEngine.resize();

    // Trigger the render on the viewport to update the on screen
    uploadViewport.render();

    uploadViewportElement.addEventListener(
      Enums.Events.IMAGE_RENDERED,
      function updateViewport(event) {
        //TODO correctly type this
        const enabledElement = getEnabledElement(event.target) as any;
        const { viewport } = enabledElement;
        const { element } = viewport;

        const downloadCanvas = getOrCreateCanvas(element);

        const type = 'image/' + fileType;
        const dataUrl = downloadCanvas.toDataURL(type, 1);

        let newWidth = element.offsetHeight;
        let newHeight = element.offsetWidth;

        if (newWidth > defaultSize || newHeight > defaultSize) {
          const multiplier = defaultSize / Math.max(newWidth, newHeight);
          newHeight *= multiplier;
          newWidth *= multiplier;
        }

        resolve({
          dataUrl,
          width: newWidth,
          height: newHeight,
        });

        uploadViewportElement.removeEventListener(
          Enums.Events.IMAGE_RENDERED,
          updateViewport
        );
      }
    );
  });

// Enables viewport
// TODO: correctly type this
const enableViewport = (viewportElement: any, activeViewportElement: any) => {
  if (viewportElement) {
    const { renderingEngine, viewport } = getEnabledElement(
      activeViewportElement
    ) as any;

    const viewportInput = {
      viewportId: VIEWPORT_ID,
      element: viewportElement,
      type: viewport.type,
      defaultOptions: {
        background: viewport.defaultOptions.background,
        orientation: viewport.defaultOptions.orientation,
      },
    };

    renderingEngine.enableElement(viewportInput);
  }
};

// Disables a viewport
// TODO: correctly type this
const disableViewport = viewportElement => {
  if (viewportElement) {
    const { renderingEngine } = getEnabledElement(viewportElement) as any;
    return new Promise(resolve => {
      renderingEngine.disableElement(VIEWPORT_ID);
    });
  }
};

// toggle annotations from toolgroups such as length ai probes and other annotation
const toggleAnnotations = (toggle, viewportElement, activeViewportElement) => {
  const activeViewportEnabledElement = getEnabledElement(activeViewportElement);

  const uploadViewportElement = getEnabledElement(viewportElement);

  // TODO: correctly type this
  const {
    viewportId: activeViewportId,
    renderingEngineId,
  } = activeViewportEnabledElement as any;
  const { viewportId: uploadViewportId } = uploadViewportElement as any;

  if (!activeViewportEnabledElement || !uploadViewportElement) {
    return;
  }
  // TODO: correctly type this
  const toolGroup = ToolGroupManager.getToolGroupForViewport(
    activeViewportId,
    renderingEngineId
  ) as any;

  // add the viewport to the toolGroup
  toolGroup.addViewport(uploadViewportId);

  Object.keys(toolGroup._toolInstances).forEach(toolName => {
    // make all tools Enabled so that they can not be interacted with
    // in the download viewport
    if (toggle && toolName !== 'Crosshairs') {
      try {
        toolGroup.setToolEnabled(toolName);
      } catch (e) {
        console.log(e);
      }
    } else {
      toolGroup.setToolDisabled(toolName);
    }
  });
};
