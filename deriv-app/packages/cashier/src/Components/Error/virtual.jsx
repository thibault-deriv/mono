import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Text } from '@deriv/components';
import { isMobile } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import 'Sass/virtual.scss';

const Virtual = ({ is_dark_mode_on, toggleAccountsDialog }) => {
    return (
        <div className='cashier__wrapper'>
            <React.Fragment>
                <div
                    className={classNames(
                        'virtual__account-switch-icon',
                        is_dark_mode_on ? 'virtual__account-switch-icon--dark' : 'virtual__account-switch-icon--light'
                    )}
                />
                <Text as='h2' align='center' weight='bold' color='prominent' className='virtual__header'>
                    <Localize i18n_default_text={'You are using a demo account'} />
                </Text>
                <Text
                    as='p'
                    size={isMobile() ? 'xxs' : 'xs'}
                    line_height='s'
                    align='center'
                    className='cashier__paragraph cashier__text'
                >
                    <Localize
                        i18n_default_text='You need to switch to a real money account to use this feature.<0/>You can do this by selecting a real account from the <1>Account Switcher.</1>'
                        components={[
                            <br key={0} />,
                            <span key={1} className='virtual__account-switch-text' onClick={toggleAccountsDialog} />,
                        ]}
                    />
                </Text>
            </React.Fragment>
        </div>
    );
};

Virtual.propTypes = {
    is_dark_mode_on: PropTypes.bool,
    toggleAccountsDialog: PropTypes.func,
};

export default connect(({ ui }) => ({
    is_dark_mode_on: ui.is_dark_mode_on,
    toggleAccountsDialog: ui.toggleAccountsDialog,
}))(withRouter(Virtual));
