import classNames from 'classnames';
import React from 'react';
import { Div100vhContainer, Icon, MobileDrawer, ToggleSwitch, Text } from '@deriv/components';
import { routes, PlatformContext } from '@deriv/shared';
import { localize, getAllowedLanguages, getLanguage } from '@deriv/translations';
import { NetworkStatus } from 'App/Components/Layout/Footer';
import ServerTime from 'App/Containers/server-time.jsx';
import { BinaryLink } from 'App/Components/Routes';
import getRoutesConfig from 'App/Constants/routes-config';
import { changeLanguage } from 'Utils/Language';
import LiveChat from 'App/Components/Elements/LiveChat';

const MenuLink = ({
    changeCurrentLanguage,
    link_to,
    icon,
    is_active,
    is_disabled,
    is_language,
    suffix_icon,
    text,
    onClickLink,
}) => {
    if (is_language) {
        return (
            <span
                className={classNames('header__menu-mobile-link', {
                    'header__menu-mobile-link--disabled': is_disabled,
                    'header__menu-mobile-link--active': is_active,
                })}
                active_class='header__menu-mobile-link--active'
                onClick={() => {
                    onClickLink();
                    changeLanguage(link_to, changeCurrentLanguage);
                }}
            >
                <Icon className='header__menu-mobile-link-flag-icon' size={32} icon={icon} />
                <span className='header__menu-mobile-link-text'>{text}</span>
                {suffix_icon && <Icon className='header__menu-mobile-link-suffix-icon' icon={suffix_icon} />}
            </span>
        );
    } else if (!link_to) {
        return (
            <div
                className={classNames('header__menu-mobile-link', {
                    'header__menu-mobile-link--disabled': is_disabled,
                })}
            >
                <Icon className='header__menu-mobile-link-icon' icon={icon} />
                <span className='header__menu-mobile-link-text'>{text}</span>
                {suffix_icon && <Icon className='header__menu-mobile-link-suffix-icon' icon={suffix_icon} />}
            </div>
        );
    }

    return (
        <BinaryLink
            to={link_to}
            className={classNames('header__menu-mobile-link', {
                'header__menu-mobile-link--disabled': is_disabled,
                'header__menu-mobile-link--active': is_active,
            })}
            active_class='header__menu-mobile-link--active'
            onClick={onClickLink}
        >
            <Icon className='header__menu-mobile-link-icon' icon={icon} />
            <Text
                className={text === localize('Trade') ? '' : 'header__menu-mobile-link-text'}
                as='h3'
                size='xs'
                weight={window.location.pathname === '/' && text === localize('Trade') ? 'bold' : null}
            >
                {text}
            </Text>
            {suffix_icon && <Icon className='header__menu-mobile-link-suffix-icon' icon={suffix_icon} />}
        </BinaryLink>
    );
};

const ToggleMenuDrawer = React.forwardRef(
    (
        {
            changeCurrentLanguage,
            account_status,
            disableApp,
            enableApp,
            is_dark_mode,
            is_logged_in,
            is_onramp_tab_visible,
            is_p2p_enabled,
            is_payment_agent_transfer_visible,
            is_payment_agent_visible,
            is_account_transfer_visible,
            is_virtual,
            logoutClient,
            platform_header,
            platform_switcher,
            should_allow_authentication,
            title,
            toggleTheme,
            is_social_signup,
        },
        ref
    ) => {
        const [is_open, setIsOpen] = React.useState(false);
        const [primary_routes_config, setPrimaryRoutesConfig] = React.useState([]);
        const [secondary_routes_config, setSecondaryRoutesConfig] = React.useState([]);
        const [is_submenu_expanded, expandSubMenu] = React.useState(false);

        const { is_appstore } = React.useContext(PlatformContext);

        React.useEffect(() => {
            const processRoutes = () => {
                const routes_config = getRoutesConfig({ is_appstore }, is_social_signup);
                let primary_routes = [];
                let secondary_routes = [];

                if (is_appstore) {
                    primary_routes = [
                        routes.my_apps,
                        routes.explore,
                        routes.wallets,
                        routes.platforms,
                        routes.trade_types,
                        routes.markets,
                    ];
                    secondary_routes = [];
                } else {
                    primary_routes = [routes.reports, routes.account, routes.cashier];
                    secondary_routes = [];
                }

                setPrimaryRoutesConfig(getFilteredRoutesConfig(routes_config, primary_routes));
                setSecondaryRoutesConfig(getFilteredRoutesConfig(routes_config, secondary_routes));
            };

            if (account_status || should_allow_authentication) {
                processRoutes();
            }
        }, [is_appstore, account_status, should_allow_authentication, is_social_signup]);

        const toggleDrawer = React.useCallback(() => {
            setIsOpen(!is_open);
            expandSubMenu(false);
        }, [expandSubMenu, is_open]);

        React.useImperativeHandle(ref, () => ({
            toggleDrawer,
        }));

        const getFilteredRoutesConfig = (all_routes_config, routes_to_filter) => {
            const subroutes_config = all_routes_config.flatMap(i => i.routes || []);

            return routes_to_filter
                .map(
                    path => all_routes_config.find(r => r.path === path) || subroutes_config.find(r => r.path === path)
                )
                .filter(route => route);
        };

        const getRoutesWithSubMenu = (route_config, idx) => {
            const has_access = route_config.is_authenticated ? is_logged_in : true;
            if (!has_access) return null;

            if (!route_config.routes) {
                return (
                    <MobileDrawer.Item key={idx}>
                        <MenuLink
                            link_to={route_config.path}
                            icon={route_config.icon_component}
                            text={route_config.getTitle()}
                            onClickLink={toggleDrawer}
                            changeCurrentLanguage={changeCurrentLanguage}
                        />
                    </MobileDrawer.Item>
                );
            }

            const has_subroutes = route_config.routes.some(route => route.subroutes);

            return (
                <MobileDrawer.SubMenu
                    key={idx}
                    has_subheader
                    submenu_icon={route_config.icon_component}
                    submenu_title={route_config.getTitle()}
                    submenu_suffix_icon='IcChevronRight'
                    onToggle={expandSubMenu}
                    route_config_path={route_config.path}
                >
                    {!has_subroutes &&
                        route_config.routes.map((route, index) => {
                            if (
                                !route.is_invisible &&
                                (route.path !== routes.cashier_pa || is_payment_agent_visible) &&
                                (route.path !== routes.cashier_pa_transfer || is_payment_agent_transfer_visible) &&
                                (route.path !== routes.cashier_p2p || is_p2p_enabled) &&
                                (route.path !== routes.cashier_onramp || is_onramp_tab_visible) &&
                                (route.path !== routes.cashier_acc_transfer || is_account_transfer_visible)
                            ) {
                                return (
                                    <MobileDrawer.Item key={index}>
                                        <MenuLink
                                            link_to={route.path}
                                            icon={route.icon_component}
                                            text={route.getTitle()}
                                            onClickLink={toggleDrawer}
                                            changeCurrentLanguage={changeCurrentLanguage}
                                        />
                                    </MobileDrawer.Item>
                                );
                            }
                            return undefined;
                        })}
                    {has_subroutes &&
                        route_config.routes.map((route, index) => {
                            return route.subroutes ? (
                                <MobileDrawer.SubMenuSection
                                    key={index}
                                    section_icon={route.icon}
                                    section_title={route.getTitle()}
                                >
                                    {route.subroutes.map((subroute, subindex) => (
                                        <MenuLink
                                            key={subindex}
                                            is_disabled={
                                                (!should_allow_authentication &&
                                                    /proof-of-address/.test(subroute.path)) ||
                                                (!should_allow_authentication &&
                                                    /proof-of-identity/.test(subroute.path)) ||
                                                (is_virtual && /financial-assessment/.test(subroute.path)) ||
                                                subroute.is_disabled
                                            }
                                            link_to={subroute.path}
                                            text={subroute.getTitle()}
                                            onClickLink={toggleDrawer}
                                            changeCurrentLanguage={changeCurrentLanguage}
                                        />
                                    ))}
                                </MobileDrawer.SubMenuSection>
                            ) : (
                                <MobileDrawer.Item key={index}>
                                    <MenuLink
                                        link_to={route.path}
                                        icon={route.icon_component}
                                        text={route.getTitle()}
                                        onClickLink={toggleDrawer}
                                    />
                                </MobileDrawer.Item>
                            );
                        })}
                </MobileDrawer.SubMenu>
            );
        };

        const getLanguageRoutes = () => {
            const currentLanguage = getLanguage();

            return (
                <MobileDrawer.SubMenu
                    has_subheader
                    submenu_icon='IcLanguage'
                    submenu_title={localize('Language')}
                    submenu_suffix_icon='IcChevronRight'
                    onToggle={expandSubMenu}
                >
                    {Object.keys(getAllowedLanguages()).map((lang, idx) => (
                        <MobileDrawer.Item key={idx}>
                            <MenuLink
                                is_language
                                is_active={currentLanguage === lang}
                                link_to={lang}
                                icon={`IcFlag${lang.replace('_', '-')}`}
                                text={getAllowedLanguages()[lang]}
                                onClickLink={toggleDrawer}
                                changeCurrentLanguage={changeCurrentLanguage}
                            />
                        </MobileDrawer.Item>
                    ))}
                </MobileDrawer.SubMenu>
            );
        };

        return (
            <React.Fragment>
                <a id='dt_mobile_drawer_toggle' onClick={toggleDrawer} className='header__mobile-drawer-toggle'>
                    <Icon
                        icon={is_appstore && !is_logged_in ? 'IcHamburgerWhite' : 'IcHamburger'}
                        width='16px'
                        height='16px'
                        className='header__mobile-drawer-icon'
                    />
                </a>
                <MobileDrawer
                    alignment={is_appstore ? 'right' : 'left'}
                    icon_class='header__menu-toggle'
                    is_open={is_open}
                    toggle={toggleDrawer}
                    id='dt_mobile_drawer'
                    enableApp={enableApp}
                    disableApp={disableApp}
                    title={title || title === '' ? title : localize('Menu')}
                    livechat={is_appstore ? null : <LiveChat is_mobile_drawer />}
                    height='100vh'
                    width='295px'
                >
                    <Div100vhContainer height_offset='40px'>
                        <div className='header__menu-mobile-body-wrapper'>
                            {is_appstore && (
                                <MobileDrawer.Body>
                                    {primary_routes_config.map((route_config, idx) =>
                                        getRoutesWithSubMenu(route_config, idx)
                                    )}
                                </MobileDrawer.Body>
                            )}
                            {!is_appstore && (
                                <React.Fragment>
                                    <MobileDrawer.SubHeader
                                        className={classNames({
                                            'dc-mobile-drawer__subheader--hidden': is_submenu_expanded,
                                        })}
                                    >
                                        {platform_switcher}
                                    </MobileDrawer.SubHeader>
                                    <MobileDrawer.Body>
                                        <div
                                            className='header__menu-mobile-platform-switcher'
                                            id='mobile_platform_switcher'
                                        />
                                        <MobileDrawer.Item>
                                            <MenuLink
                                                link_to={routes.trade}
                                                icon='IcTrade'
                                                text={localize('Trade')}
                                                onClickLink={toggleDrawer}
                                                changeCurrentLanguage={changeCurrentLanguage}
                                            />
                                        </MobileDrawer.Item>
                                        {primary_routes_config.map((route_config, idx) =>
                                            getRoutesWithSubMenu(route_config, idx)
                                        )}
                                        {getLanguageRoutes()}
                                        {platform_header !== 'DBot' && (
                                            <MobileDrawer.Item
                                                className='header__menu-mobile-theme'
                                                onClick={e => {
                                                    e.preventDefault();
                                                    toggleTheme(!is_dark_mode);
                                                }}
                                            >
                                                <div className={classNames('header__menu-mobile-link')}>
                                                    <Icon className='header__menu-mobile-link-icon' icon={'IcTheme'} />
                                                    <span className='header__menu-mobile-link-text'>
                                                        {localize('Dark theme')}
                                                    </span>
                                                    <ToggleSwitch
                                                        id='dt_mobile_drawer_theme_toggler'
                                                        classNameLabel='header__menu-mobile-link-toggler-label'
                                                        classNameButton={classNames(
                                                            'header__menu-mobile-link-toggler-button',
                                                            {
                                                                'header__menu-mobile-link-toggler-button--active':
                                                                    is_dark_mode,
                                                            }
                                                        )}
                                                        handleToggle={() => toggleTheme(!is_dark_mode)}
                                                        is_enabled={is_dark_mode}
                                                    />
                                                </div>
                                            </MobileDrawer.Item>
                                        )}

                                        {secondary_routes_config.map(route_config =>
                                            getRoutesWithSubMenu(route_config)
                                        )}
                                        {is_logged_in && (
                                            <MobileDrawer.Item
                                                onClick={() => {
                                                    logoutClient();
                                                    toggleDrawer();
                                                }}
                                            >
                                                <MenuLink icon='IcLogout' text={localize('Log out')} />
                                            </MobileDrawer.Item>
                                        )}
                                    </MobileDrawer.Body>
                                </React.Fragment>
                            )}
                        </div>
                        <MobileDrawer.Footer>
                            <ServerTime is_mobile />
                            <NetworkStatus is_mobile />
                        </MobileDrawer.Footer>
                    </Div100vhContainer>
                </MobileDrawer>
            </React.Fragment>
        );
    }
);
ToggleMenuDrawer.displayName = 'ToggleMenuDrawer';
export default ToggleMenuDrawer;
