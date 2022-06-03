import PropTypes from 'prop-types';
import React from 'react';
import { Button, Clipboard, Icon, Text } from '@deriv/components';
import { isCryptocurrency, isMobile } from '@deriv/shared';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import RecentTransaction from 'Components/recent-transaction.jsx';
import { getAccountText } from '_common/utility';
import 'Sass/crypto-withdraw-receipt.scss';

const Status = () => {
    return (
        <Text as='p' color='prominent' weight='bold' align='center' className='crypto-withdraw-receipt__status'>
            <Icon
                icon='IcCircleDynamicColor'
                color='orange'
                size={8}
                className='crypto-withdraw-receipt__status-icon'
            />
            <Localize i18n_default_text='In review' />
        </Text>
    );
};

const AcountInformation = ({ account }) => {
    return (
        <div className='crypto-withdraw-receipt__account-info'>
            <div className='crypto-withdraw-receipt__account-info-detail'>
                <Icon icon={account?.platform_icon || `IcCurrency-${account?.currency?.toLowerCase()}`} size={32} />
                <Text
                    color='prominent'
                    weight='bold'
                    size={isMobile() ? 'xxs' : 's'}
                    align='center'
                    className='crypto-withdraw-receipt__account-info-detail-text'
                >
                    {account?.currency?.toUpperCase()}
                </Text>
            </div>
            <Text
                color='less-prominent'
                size={isMobile() ? 'xs' : 's'}
                align='center'
                className='crypto-withdraw-receipt__account-info-detail-text'
            >
                {account?.value}
            </Text>
        </div>
    );
};

const WalletInformation = ({ account, blockchain_address }) => {
    const text = getAccountText(account);
    return (
        <div className='crypto-withdraw-receipt__account-info'>
            <div className='crypto-withdraw-receipt__account-info-detail'>
                <Icon icon='IcCashierWithdrawWallet' size={32} />
                <Text
                    color='prominent'
                    weight='bold'
                    align='center'
                    className='crypto-withdraw-receipt__account-info-detail-text'
                >
                    <Localize
                        i18n_default_text='{{account_text}} wallet'
                        values={{
                            account_text: text,
                        }}
                    />
                </Text>
            </div>
            <div className='crypto-withdraw-receipt__account-info-address'>
                <Text
                    color='less-prominent'
                    as='p'
                    size={isMobile() ? 'xxs' : 'xs'}
                    align='center'
                    className='crypto-withdraw-receipt__account-info-detail-text'
                >
                    {blockchain_address}
                </Text>
                <Clipboard
                    text_copy={blockchain_address}
                    info_message={isMobile() ? '' : localize('copy')}
                    icon='IcCashierClipboard'
                    success_message={localize('copied!')}
                    popoverAlignment={isMobile() ? 'left' : 'bottom'}
                />
            </div>
        </div>
    );
};

const CryptoWithdrawReceipt = ({
    account,
    blockchain_address,
    withdraw_amount,
    crypto_transactions,
    currency,
    is_switching,
    resetWithrawForm,
    recentTransactionOnMount,
    setIsCryptoTransactionsVisible,
    setIsWithdrawConfirmed,
    tab_index,
}) => {
    React.useEffect(() => {
        recentTransactionOnMount();
    }, [recentTransactionOnMount]);

    React.useEffect(() => {
        return () => {
            setIsWithdrawConfirmed(false);
            resetWithrawForm();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_switching, tab_index]);

    return (
        <div className='cashier__wrapper'>
            <Text
                as='h2'
                color='prominent'
                weight='bold'
                align='center'
                className='cashier__header cashier__content-header'
            >
                <Localize i18n_default_text='Your withdrawal will be processed within 24 hours' />
            </Text>
            <div className='crypto-withdraw-receipt__detail'>
                {!isMobile() && <Status />}
                <Text
                    as='p'
                    color='profit-success'
                    weight='bold'
                    align='center'
                    size={isMobile() ? 'm' : 'l'}
                    className='crypto-withdraw-receipt__crypto'
                >
                    <Localize
                        i18n_default_text='{{withdraw_amount}} {{currency_symbol}}'
                        values={{
                            withdraw_amount,
                            currency_symbol: currency?.toUpperCase(),
                        }}
                    />
                </Text>
                {isMobile() && <Status />}
                <AcountInformation account={account} />
                <Icon className='crypto-withdraw-receipt__icon' icon='IcArrowDown' size={30} />
                <WalletInformation account={account} blockchain_address={blockchain_address} />
            </div>
            <div className='crypto-withdraw-receipt__button-wrapper'>
                <Button
                    id='withdraw_transaction'
                    className='crypto-withdraw-receipt__button crypto-withdraw-receipt__button-left'
                    text={localize('View transaction history')}
                    onClick={() => setIsCryptoTransactionsVisible(true)}
                    secondary
                />
                <Button
                    id='crypto-withdraw-receipt'
                    className='crypto-withdraw-receipt__button'
                    has_effect
                    text={localize('Make a new withdrawal')}
                    onClick={() => setIsWithdrawConfirmed(false)}
                    primary
                />
            </div>
            {isMobile() && isCryptocurrency(currency) && crypto_transactions?.length ? <RecentTransaction /> : null}
        </div>
    );
};

CryptoWithdrawReceipt.propTypes = {
    account: PropTypes.object,
    crypto_transactions: PropTypes.array,
    blockchain_address: PropTypes.string,
    currency: PropTypes.string,
    is_switching: PropTypes.bool,
    resetWithrawForm: PropTypes.func,
    recentTransactionOnMount: PropTypes.func,
    setIsCryptoTransactionsVisible: PropTypes.func,
    setIsWithdrawConfirmed: PropTypes.func,
    tab_index: PropTypes.number,
};

export default connect(({ client, modules }) => ({
    account: modules.cashier.account_transfer.selected_from,
    blockchain_address: modules.cashier.withdraw.blockchain_address,
    withdraw_amount: modules.cashier.withdraw.withdraw_amount,
    crypto_transactions: modules.cashier.transaction_history.crypto_transactions,
    currency: client.currency,
    is_switching: client.is_switching,
    resetWithrawForm: modules.cashier.withdraw.resetWithrawForm,
    recentTransactionOnMount: modules.cashier.transaction_history.onMount,
    setIsCryptoTransactionsVisible: modules.cashier.transaction_history.setIsCryptoTransactionsVisible,
    setIsWithdrawConfirmed: modules.cashier.withdraw.setIsWithdrawConfirmed,
    tab_index: modules.cashier.general_store.cashier_route_tab_index,
}))(CryptoWithdrawReceipt);
