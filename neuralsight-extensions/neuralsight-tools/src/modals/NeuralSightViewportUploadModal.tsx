//TODO:Urgent clean the code

import React, { useEffect, useState } from 'react';
import { getEnabledElement as OHIFgetEnabledElement } from '@ohif/extension-cornerstone/src/state';
import UploadImageForm from '../components/UploadImageForm';
import { postPatientStudy } from '../utils/api';

const DEFAULT_SIZE = 512;
const MAX_TEXTURE_SIZE = 10000;
const VIEWPORT_ID = 'neuralsight-viewport-upload-form';

type Props = {
  onClose: () => any;
  activeViewportIndex?: number | undefined;
  cornerstoneViewportService?: any;
};

const NeuralSightViewportUploadForm = ({
  onClose,
  activeViewportIndex,
  cornerstoneViewportService,
}: Props) => {
  // FIXME: clean this if not need anymore

  // const enabledElement = OHIFgetEnabledElement(activeViewportIndex);
  // const activeViewportElement = enabledElement?.element;
  // const activeViewportEnabledElement = getEnabledElement(activeViewportElement);

  // const {
  //   viewportId: activeViewportId,
  //   renderingEngineId,
  // } = activeViewportEnabledElement;

  // const toolGroup = ToolGroupManager.getToolGroupForViewport(
  //   activeViewportId,
  //   renderingEngineId
  // );

  // const toolModeAndBindings = Object.keys(toolGroup.toolOptions).reduce(
  //   (acc, toolName) => {
  //     const tool = toolGroup.toolOptions[toolName];
  //     const { mode, bindings } = tool;

  //     return {
  //       ...acc,
  //       [toolName]: {
  //         mode,
  //         bindings,
  //       },
  //     };
  //   },
  //   {}
  // );

  // useEffect(() => {
  //   return () => {
  //     Object.keys(toolModeAndBindings).forEach(toolName => {
  //       const { mode, bindings } = toolModeAndBindings[toolName];
  //       toolGroup?.setToolMode(toolName, mode, { bindings });
  //     });
  //   };
  // }, []);

  return (
    <UploadImageForm
      onClose={onClose}
      defaultSize={DEFAULT_SIZE}
      canvasClass={'cornerstone-canvas'}
      // to get the function from utils
      uploadImage={postPatientStudy}
    />
  );
};

export default NeuralSightViewportUploadForm;
