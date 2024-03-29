import { Types } from '@ohif/core/src';
import { id } from './id';
import getPanelModule from './getPanelModule';
import getCommandsModule from './getCommandModule';
// import getDataSourcesModule from './getDataSourcesModule';
import getToolbarModule from './getToolBarModule';
import getLayoutTemplateModule from './getLayoutTemplateModule';
import getCustomizationModule from './getCustomizationModule';

/**
 * You can remove any of the following modules if you don't need them.
 */
const neuralsightExtension: Types.Extensions.Extension = {
  /**
   * Only required property. Should be a unique value across all extensions.
   * You ID can be anything you want, but it should be unique.
   */
  id,

  /**
   * Perform any pre-registration tasks here. This is called before the extension
   * is registered. Usually we run tasks such as: configuring the libraries
   * (e.g. cornerstone, cornerstoneTools, ...) or registering any services that
   * this extension is providing.
   */
  // preRegistration: ({
  //   servicesManager,
  //   commandsManager,
  //   configuration = {},
  // }) => {
  //   console.debug('hello from test-extension init.js');
  // },
  getPanelModule,
  /**
   * ViewportModule should provide a list of viewports that will be available in OHIF
   * for Modes to consume and use in the viewports. Each viewport is defined by
   * {name, component} object. Example of a viewport module is the CornerstoneViewport
   * that is provided by the Cornerstone extension in OHIF.
   */
  // getViewportModule: ({
  //   servicesManager,
  //   commandsManager,
  //   extensionManager,
  // }) => {},
  getToolbarModule,
  /**
   * LayoutTemplateModule should provide a list of layout templates that will be
   * available in OHIF for Modes to consume and use to layout the viewer.
   * Each layout template is defined by a { name, id, component}. Examples include
   * the default layout template provided by the default extension which renders
   * a Header, left and right sidebars, and a viewport section in the middle
   * of the viewer.
   */
  getLayoutTemplateModule,
  /**
   * SopClassHandlerModule should provide a list of sop class handlers that will be
   * available in OHIF for Modes to consume and use to create displaySets from Series.
   * Each sop class handler is defined by a { name, sopClassUids, getDisplaySetsFromSeries}.
   * Examples include the default sop class handler provided by the default extension
   */
  // getSopClassHandlerModule: ({
  //   servicesManager,
  //   commandsManager,
  //   extensionManager,
  // }) => {
  //   console.log('SopClassHandler');
  // },
  /**
   * HangingProtocolModule should provide a list of hanging protocols that will be
   * available in OHIF for Modes to use to decide on the structure of the viewports
   * and also the series that hung in the viewports. Each hanging protocol is defined by
   * { name, protocols}. Examples include the default hanging protocol provided by
   * the default extension that shows 2x2 viewports.
   */
  // getHangingProtocolModule: ({
  //   servicesManager,
  //   commandsManager,
  //   extensionManager,
  // }) => {
  //   console.log('Hangingprotocol');
  // },
  /**
   * CommandsModule should provide a list of commands that will be available in OHIF
   * for Modes to consume and use in the viewports. Each command is defined by
   * an object of { actions, definitions, defaultContext } where actions is an
   * object of functions, definitions is an object of available commands, their
   * options, and defaultContext is the default context for the command to run against.
   */
  getCommandsModule,

  /**
   * ContextModule should provide a list of context that will be available in OHIF
   * and will be provided to the Modes. A context is a state that is shared OHIF.
   * Context is defined by an object of { name, context, provider }. Examples include
   * the measurementTracking context provided by the measurementTracking extension.
   */
  // getContextModule: ({
  //   servicesManager,
  //   commandsManager,
  //   extensionManager,
  // }) => {
  //   console.log('getContext');
  // },
  /**
   * DataSourceModule should provide a list of data sources to be used in OHIF.
   * DataSources can be used to map the external data formats to the OHIF's
   * native format. DataSources are defined by an object of { name, type, createDataSource }.
   */
  // getDataSourcesModule,

  /**
   * CustomizationModule Here for custom ui
   */
  getCustomizationModule,
};

export default neuralsightExtension;
