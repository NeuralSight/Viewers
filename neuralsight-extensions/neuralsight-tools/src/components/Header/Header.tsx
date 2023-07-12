import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { NavBar, Svg, Icon, IconButton, Dropdown } from '@ohif/ui';
import { AnyObject, MenuOptionType } from '../../../data';

type PropType = {
  children: ReactNode;
  menuOptions: MenuOptionType[];
  isReturnEnabled: boolean;
  onClickReturnButton: () => void;
  WhiteLabeling: AnyObject;
  isSticky: boolean;
  rightSideItems: ReactNode;
};

function Header({
  children,
  menuOptions,
  isReturnEnabled,
  onClickReturnButton,
  isSticky,
  WhiteLabeling,
  rightSideItems,
  ...props
}: PropType): ReactNode {
  const { t } = useTranslation('Header');

  // TODO: this should be passed in as a prop instead and the react-router-dom
  // dependency should be dropped
  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  return (
    <NavBar
      className="justify-between border-b-4 border-black"
      isSticky={isSticky}
    >
      <div className="flex justify-between flex-1">
        {/* left side of the Header */}
        <div className="flex items-center">
          {/* // TODO: Should preserve filter/sort
              // Either injected service? Or context (like react router's `useLocation`?) */}
          <div
            className={classNames(
              'inline-flex items-center mr-3',
              isReturnEnabled && 'cursor-pointer'
            )}
            onClick={onClickReturn}
          >
            {isReturnEnabled && (
              <Icon name="chevron-left" className="w-8 text-primary-active" />
            )}
            <div className="ml-4">
              {WhiteLabeling?.createLogoComponentFn?.(React, props) || (
                <Svg name="logo-ohif" />
              )}
            </div>
          </div>
        </div>

        {/* Center of the Header */}
        <div className="flex items-center">{children}</div>

        {/* Left Side of the header */}
        <div className="flex items-center">
          {rightSideItems}
          <Dropdown id="options" showDropdownIcon={false} list={menuOptions}>
            <IconButton
              id={'options-settings-icon'}
              variant="text"
              color="inherit"
              size="initial"
              className="text-primary-active"
            >
              <Icon name="settings" />
            </IconButton>
            <IconButton
              id={'options-chevron-down-icon'}
              variant="text"
              color="inherit"
              size="initial"
              className="text-primary-active"
            >
              <Icon name="chevron-down" />
            </IconButton>
          </Dropdown>
        </div>
      </div>
    </NavBar>
  );
}

export default Header;
