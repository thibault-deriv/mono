import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router';
import { Button, Icon, Text } from '@deriv/components';
import { formatMoney, getCurrencyDisplayCode, isMobile, routes } from '@deriv/shared';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import PaymentAgentDetails from '../payment-agent-details.jsx';
import 'Sass/payment-agent-receipt.scss';

const openStatement = (history, resetPaymentAgent) => {
    history.push(routes.statement);
    resetPaymentAgent();
};

const PaymentAgentReceipt = ({ currency, history, is_from_derivgo, loginid, receipt, resetPaymentAgent }) => {
    React.useEffect(() => {
        return () => resetPaymentAgent();
    }, [resetPaymentAgent]);

    const currency_display_code = getCurrencyDisplayCode(currency);

    return (
        <div className='cashier__wrapper--align-left payment-agent-receipt'>
            <div className='cashier__success'>
                <Text
                    as='h1'
                    align='center'
                    color='prominent'
                    line_height='m'
                    size={isMobile() ? 'xs' : 's'}
                    weight='bold'
                >
                    <Localize i18n_default_text='Your funds have been transferred' />
                </Text>
                <Text
                    as='p'
                    size='l'
                    weight='bold'
                    lh='xs'
                    color='profit-success'
                    align='center'
                    className='cashier__transferred-amount'
                >
                    {formatMoney(currency, receipt.amount_transferred, true)} {currency_display_code}
                </Text>
                <div className='cashier__transferred-details-wrapper'>
                    <span className='cashier__transferred-details'>
                        <Text as='span' size='xs' weight='bold' className='payment-agent-receipt__text--end'>
                            {currency_display_code}
                        </Text>
                        <Text as='span' size='xs' color='less-prominent'>
                            {loginid}
                        </Text>
                    </span>
                    <Icon size={32} icon={`IcCurrency-${currency.toLowerCase()}`} />
                    <Icon className='cashier__transferred-icon' icon='IcArrowLeftBold' />
                    <Icon size={32} icon='IcPA' />
                    <span className='cashier__transferred-details'>
                        {receipt.payment_agent_name && (
                            <Text as='span' size='xs' weight='bold'>
                                {receipt.payment_agent_name}
                            </Text>
                        )}
                        <Text as='span' color='less-prominent' size='xs'>
                            {receipt.payment_agent_id}
                        </Text>
                    </span>
                </div>
            </div>
            <Text as='h1' color='prominent' line_height='m' size='s' weight='bold'>
                <Localize i18n_default_text='IMPORTANT NOTICE TO RECEIVE YOUR FUNDS' />
            </Text>
            <Text
                as='p'
                color='prominent'
                size={isMobile() ? 'xxs' : 'xs'}
                line_height='m'
                className='payment-agent-receipt__explanation cashier__paragraph'
            >
                <Localize
                    i18n_default_text={
                        "You're not done yet. To receive the transferred funds, you must contact the payment agent for further instruction. A summary of this transaction has been emailed to you for your records."
                    }
                />
            </Text>
            {receipt.payment_agent_name && (
                <div className='payment-agent-receipt__transferred-contact-wrapper'>
                    <Text
                        as='p'
                        size={isMobile() ? 'xxs' : 'xs'}
                        line_height='m'
                        className='cashier__paragraph payment-agent-receipt__paragraph'
                    >
                        <Localize
                            i18n_default_text='{{payment_agent}} agent contact details:'
                            values={{ payment_agent: receipt.payment_agent_name }}
                            options={{ interpolation: { escapeValue: false } }}
                        />
                    </Text>
                    <PaymentAgentDetails
                        className='payment-agent-receipt__transferred-contact'
                        payment_agent_email={receipt.payment_agent_email}
                        payment_agent_phones={receipt.payment_agent_phone}
                        payment_agent_urls={receipt.payment_agent_url}
                    />
                </div>
            )}
            <div className='cashier__form-submit'>
                {!is_from_derivgo && (
                    <Button
                        className='cashier__form-submit-button'
                        has_effect
                        text={localize('View in statement')}
                        onClick={() => openStatement(history, resetPaymentAgent)}
                        secondary
                        large
                    />
                )}
                <Button
                    className='cashier__form-submit-button cashier__done-button'
                    has_effect
                    text={localize('Make a new transfer')}
                    onClick={resetPaymentAgent}
                    primary
                    large
                />
            </div>
        </div>
    );
};

PaymentAgentReceipt.propTypes = {
    currency: PropTypes.string,
    history: PropTypes.object,
    is_from_derivgo: PropTypes.bool,
    loginid: PropTypes.string,
    receipt: PropTypes.object,
    resetPaymentAgent: PropTypes.func,
};

export default withRouter(
    connect(({ client, common, modules }) => ({
        currency: client.currency,
        is_from_derivgo: common.is_from_derivgo,
        loginid: client.loginid,
        receipt: modules.cashier.payment_agent.receipt,
        resetPaymentAgent: modules.cashier.payment_agent.resetPaymentAgent,
    }))(PaymentAgentReceipt)
);
