import PropTypes from 'prop-types';
import React from 'react';
import {
    Icon,
    Modal,
    Tabs,
    Button,
    DesktopWrapper,
    Div100vhContainer,
    MobileWrapper,
    MultiStep,
    PageOverlay,
    ThemedScrollbars,
    UILoader,
    Text,
} from '@deriv/components';
import { localize, Localize } from '@deriv/translations';
import {
    isMobile,
    validLength,
    validPassword,
    getErrorMessages,
    getCFDPlatformLabel,
    CFD_PLATFORMS,
} from '@deriv/shared';
import { connect } from 'Stores/connect';
import CFDStore from 'Stores/Modules/CFD/cfd-store';
import TradingPasswordManager from './trading-password-manager';
import InvestorPasswordManager from './investor-password-manager';

const CountdownComponent = ({ count_from = 60, onTimeout }) => {
    const [count, setCount] = React.useState(count_from);

    React.useEffect(() => {
        if (count !== 0) {
            const interval = setTimeout(() => {
                setCount(count - 1);
            }, 1000);

            return () => clearTimeout(interval);
        }

        onTimeout();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);
    return <span className='countdown'>{count}</span>;
};

const CFDPasswordReset = ({ sendVerifyEmail, account_type, account_group, server, password_type }) => {
    const [is_resend_verification_requested, setResendVerification] = React.useState(false);
    const [is_resend_verification_sent, setResendVerificationSent] = React.useState(false);

    React.useEffect(() => {
        localStorage.setItem('cfd_reset_password_intent', [server, account_group, account_type].join('.'));
        localStorage.setItem('cfd_reset_password_type', password_type);
        sendVerifyEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickVerification = () => {
        setResendVerification(true);
    };

    const resendVerification = () => {
        sendVerifyEmail();
        setResendVerificationSent(true);
    };

    return (
        <div className='cfd-verification-email-sent'>
            <Icon icon='IcEmailSent' size={128} />
            <h2 className='cfd-verification-email-sent__title'>
                <Localize i18n_default_text="We've sent you an email" />
            </h2>
            <Text as='p' size='xs' align='center'>
                <Localize i18n_default_text='Please click on the link in the email to reset your password.' />
            </Text>
            {!is_resend_verification_requested && (
                <Button className='cfd-verification-email-sent__resend-button' primary onClick={onClickVerification}>
                    <Localize i18n_default_text="Didn't receive the email?" />
                </Button>
            )}
            {is_resend_verification_requested && (
                <>
                    <Text
                        as='p'
                        size='xs'
                        align='center'
                        weight='bold'
                        className='cfd-verification-email-sent__title--sub'
                    >
                        <Localize i18n_default_text={"Didn't receive the email?"} />
                    </Text>
                    <Text as='p' size='xs' align='center'>
                        <Localize i18n_default_text="Check your spam or junk folder. If it's not there, try resending the email." />
                    </Text>
                    <Button
                        className='cfd-verification-email-sent__resend-button'
                        large
                        primary
                        disabled={is_resend_verification_sent}
                        onClick={resendVerification}
                    >
                        {!is_resend_verification_sent && <Localize i18n_default_text='Resend email' />}
                        {is_resend_verification_sent && (
                            <>
                                <Localize
                                    i18n_default_text='Resend in <0 /> seconds'
                                    components={[
                                        <CountdownComponent
                                            key={0}
                                            onTimeout={() => setResendVerificationSent(false)}
                                            count_from={60}
                                        />,
                                    ]}
                                />
                            </>
                        )}
                    </Button>
                </>
            )}
        </div>
    );
};

const CFDPasswordManagerTabContentWrapper = ({ multi_step_ref, steps }) => (
    <MultiStep ref={multi_step_ref} steps={steps} className='cfd-password-manager' lbl_previous={localize('Back')} />
);

const CFDPasswordManagerTabContent = ({
    toggleModal,
    selected_login,
    email,
    setPasswordType,
    multi_step_ref,
    platform,
    onChangeActiveTabIndex,
    account_group,
}) => {
    const [active_tab_index, setActiveTabIndex] = React.useState(0);
    const [error_message_investor, setErrorMessageInvestor] = React.useState('');
    const [is_submit_success_investor, setSubmitSuccessInvestor] = React.useState(false);

    // view height - margin top and bottom of modal - modal title - modal content margin top and bottom - table title
    const password_container_height = 'calc(100vh - 84px - 5.6rem - 8.8rem - 4rem)';
    const validatePassword = values => {
        const errors = {};

        if (
            !validLength(values.new_password, {
                min: 8,
                max: 25,
            })
        ) {
            errors.new_password = localize('You should enter {{min_number}}-{{max_number}} characters.', {
                min_number: 8,
                max_number: 25,
            });
        } else if (!validPassword(values.new_password)) {
            errors.new_password = getErrorMessages().password();
        } else if (values.new_password.toLowerCase() === email.toLowerCase()) {
            errors.new_password = localize('Your password cannot be the same as your email address.');
        }

        if (!values.old_password && values.old_password !== undefined) {
            errors.old_password = localize('This field is required');
        }

        return errors;
    };
    const showError = error_message => {
        setErrorMessageInvestor(error_message);
    };

    const hideError = () => {
        setErrorMessageInvestor('');
        setSubmitSuccessInvestor(true);
    };

    const onSubmit = React.useCallback(
        async values => {
            if (!selected_login) {
                return;
            }

            const error = await CFDStore.changePassword({ login: selected_login, ...values });
            if (error) {
                showError(error);
            } else {
                hideError();
            }
        },
        [selected_login]
    );

    const updateAccountTabIndex = index => {
        setActiveTabIndex(index);
        onChangeActiveTabIndex(index);
        setErrorMessageInvestor('');
        setSubmitSuccessInvestor(false);
    };

    const trading_password_manager = (
        <React.Fragment>
            <DesktopWrapper>
                <ThemedScrollbars height={password_container_height} is_bypassed={isMobile()} autohide={false}>
                    <TradingPasswordManager
                        toggleModal={toggleModal}
                        platform={platform}
                        email={email}
                        account_group={account_group}
                    />
                </ThemedScrollbars>
            </DesktopWrapper>
            <MobileWrapper>
                <Div100vhContainer className='cfd-password-manager__scroll-wrapper' height_offset='120px'>
                    <TradingPasswordManager
                        toggleModal={toggleModal}
                        platform={platform}
                        email={email}
                        account_group={account_group}
                    />
                </Div100vhContainer>
            </MobileWrapper>
        </React.Fragment>
    );

    if (platform === CFD_PLATFORMS.DXTRADE) return trading_password_manager;

    return (
        <Tabs active_index={active_tab_index} onTabItemClick={updateAccountTabIndex} top>
            <div
                label={localize('{{platform}} password', {
                    platform: getCFDPlatformLabel(platform),
                })}
            >
                {trading_password_manager}
            </div>
            <div label={localize('Investor password')}>
                <DesktopWrapper>
                    <ThemedScrollbars height={password_container_height}>
                        <InvestorPasswordManager
                            is_submit_success_investor={is_submit_success_investor}
                            toggleModal={toggleModal}
                            error_message_investor={error_message_investor}
                            validatePassword={validatePassword}
                            onSubmit={onSubmit}
                            setPasswordType={setPasswordType}
                            multi_step_ref={multi_step_ref}
                        />
                    </ThemedScrollbars>
                </DesktopWrapper>
                <MobileWrapper>
                    <Div100vhContainer className='cfd-password-manager__scroll-wrapper' height_offset='120px'>
                        <InvestorPasswordManager
                            is_submit_success_investor={is_submit_success_investor}
                            toggleModal={toggleModal}
                            error_message_investor={error_message_investor}
                            validatePassword={validatePassword}
                            onSubmit={onSubmit}
                            setPasswordType={setPasswordType}
                            multi_step_ref={multi_step_ref}
                        />
                    </Div100vhContainer>
                </MobileWrapper>
            </div>
        </Tabs>
    );
};

const CFDPasswordManagerModal = ({
    enableApp,
    email,
    disableApp,
    is_visible,
    platform,
    selected_login,
    selected_account,
    toggleModal,
    selected_account_type,
    selected_account_group,
    selected_server,
    sendVerifyEmail,
}) => {
    const multi_step_ref = React.useRef();
    const [index, setIndex] = React.useState(0);

    const [password_type, setPasswordType] = React.useState('main');

    if (!selected_login) return null;

    const getTitle = i => {
        if (i === 0) {
            return localize('Manage {{platform}} password', {
                platform: getCFDPlatformLabel(platform),
            });
        }
        return selected_account_group === 'real'
            ? localize('Manage {{platform}} Real {{account_title}} account password', {
                  platform: getCFDPlatformLabel(platform),
                  account_title: selected_account,
              })
            : localize('Manage {{platform}} Demo {{account_title}} account password', {
                  platform: getCFDPlatformLabel(platform),
                  account_title: selected_account,
              });
    };

    const getHeader = i => {
        if (i === 0) {
            return localize('Manage {{platform}} password', {
                platform: getCFDPlatformLabel(platform),
            });
        }
        return localize('Manage password');
    };

    const onChangeActiveTabIndex = i => {
        setIndex(i);
    };

    const steps = [
        {
            component: (
                <CFDPasswordManagerTabContent
                    email={email}
                    selected_login={selected_login}
                    toggleModal={toggleModal}
                    password_type={password_type}
                    setPasswordType={setPasswordType}
                    multi_step_ref={multi_step_ref}
                    platform={platform}
                    onChangeActiveTabIndex={onChangeActiveTabIndex}
                    account_group={selected_account_group}
                />
            ),
        },
        {
            component: (
                <CFDPasswordReset
                    server={selected_server}
                    sendVerifyEmail={sendVerifyEmail}
                    account_type={selected_account_type}
                    account_group={selected_account_group}
                    password_type={password_type}
                />
            ),
        },
    ];

    return (
        <React.Suspense fallback={<UILoader />}>
            <DesktopWrapper>
                <Modal
                    className='cfd-password-manager__modal'
                    disableApp={disableApp}
                    enableApp={enableApp}
                    is_open={is_visible}
                    title={getTitle(index)}
                    toggleModal={toggleModal}
                    height='688px'
                    width='904px'
                    should_header_stick_body={false}
                >
                    <CFDPasswordManagerTabContentWrapper steps={steps} multi_step_ref={multi_step_ref} />
                </Modal>
            </DesktopWrapper>
            <MobileWrapper>
                <PageOverlay
                    is_open={is_visible}
                    portal_id='deriv_app'
                    header={getHeader(index)}
                    onClickClose={toggleModal}
                >
                    <CFDPasswordManagerTabContentWrapper steps={steps} multi_step_ref={multi_step_ref} />
                </PageOverlay>
            </MobileWrapper>
        </React.Suspense>
    );
};

CFDPasswordManagerModal.propTypes = {
    email: PropTypes.string,
    is_visible: PropTypes.bool,
    selected_account: PropTypes.string,
    selected_server: PropTypes.string,
    selected_login: PropTypes.string,
    toggleModal: PropTypes.func,
    platform: PropTypes.string,
};

export default connect(({ modules: { cfd }, client, ui }) => ({
    email: client.email,
    enableApp: ui.enableApp,
    disableApp: ui.disableApp,
    sendVerifyEmail: cfd.sendVerifyEmail,
}))(CFDPasswordManagerModal);
