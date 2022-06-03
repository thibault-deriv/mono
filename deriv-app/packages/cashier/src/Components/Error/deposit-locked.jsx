import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { routes, WS } from '@deriv/shared';
import { Icon, Checklist, StaticUrl, Text } from '@deriv/components';
import { Localize, localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import CashierLocked from './cashier-locked.jsx';

const DepositsLocked = ({
    account_status,
    is_tnc_needed,
    is_financial_information_incomplete,
    is_trading_experience_incomplete,
    is_financial_account,
    onMount,
    standpoint,
}) => {
    // handle authentication locked
    const { identity, document, needs_verification } = account_status.authentication;
    const is_poi_needed = needs_verification.includes('identity');
    const is_poa_needed = needs_verification.includes('document');
    const has_poi_submitted = identity.status !== 'none';
    const has_poa_submitted = document.status !== 'none';
    const deposit_desc = standpoint.iom
        ? localize(
              'We were unable to verify your information automatically. To enable this function, you must complete the following:'
          )
        : localize('To enable this feature you must complete the following:');
    const history = useHistory();

    // handle TnC
    const acceptTnc = async () => {
        await WS.tncApproval();
        await WS.getSettings();
        onMount();
    };

    // handle all deposits lock status
    const items = [
        ...(is_poi_needed && has_poi_submitted
            ? [
                  {
                      content: localize('Check proof of identity document verification status'),
                      status: 'action',
                      onClick: () => history.push(routes.proof_of_identity),
                  },
              ]
            : []),
        ...(is_poa_needed && has_poa_submitted
            ? [
                  {
                      content: localize('Check proof of address document verification status'),
                      status: 'action',
                      onClick: () => history.push(routes.proof_of_address),
                  },
              ]
            : []),
        ...(is_tnc_needed
            ? [
                  {
                      content: (
                          <Localize
                              i18n_default_text='Accept our updated <0>terms and conditions</0>'
                              components={[<StaticUrl key={0} className='link' href='terms-and-conditions' />]}
                          />
                      ),
                      status: 'button-action',
                      onClick: () => acceptTnc(),
                      button_text: localize('I accept'),
                  },
              ]
            : []),
        ...(is_financial_account && (is_financial_information_incomplete || is_trading_experience_incomplete)
            ? [
                  {
                      content: localize('Complete the financial assessment form'),
                      status: 'action',
                      onClick: () => history.push(routes.financial_assessment),
                  },
              ]
            : []),
    ];
    return (
        <React.Fragment>
            {items.length ? (
                <div className='cashier-locked'>
                    <Icon icon='IcCashierDepositLock' className='cashier-locked__icon' />
                    <Text as='h2' weight='bold' align='center' className='cashier-locked__title'>
                        {localize('Deposits are locked')}
                    </Text>

                    <Text as='p' align='center' size='xs' className='cashier-locked__desc'>
                        {deposit_desc}
                    </Text>
                    <Checklist className='cashier-locked__checklist' items={items} />
                </div>
            ) : (
                <CashierLocked />
            )}
        </React.Fragment>
    );
};

DepositsLocked.propTypes = {
    account_status: PropTypes.object,
    is_tnc_needed: PropTypes.bool,
    is_financial_information_incomplete: PropTypes.bool,
    is_trading_experience_incomplete: PropTypes.bool,
    is_financial_account: PropTypes.bool,
    onMount: PropTypes.func,
};

export default connect(({ client, modules }) => ({
    account_status: client.account_status,
    is_tnc_needed: client.is_tnc_needed,
    is_financial_information_incomplete: client.is_financial_information_incomplete,
    is_trading_experience_incomplete: client.is_trading_experience_incomplete,
    is_financial_account: client.is_financial_account,
    onMount: modules.cashier.deposit.onMountDeposit,
    standpoint: client.standpoint,
}))(DepositsLocked);
