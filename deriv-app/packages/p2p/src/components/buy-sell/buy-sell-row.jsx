import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Table, Text, Button, Icon } from '@deriv/components';
import { isMobile } from '@deriv/shared';
import { observer } from 'mobx-react-lite';
import { buy_sell } from 'Constants/buy-sell';
import { Localize, localize } from 'Components/i18next';
import UserAvatar from 'Components/user/user-avatar';
import { useStores } from 'Stores';
import './buy-sell-row.scss';
import TradeBadge from '../trade-badge';

const BuySellRow = ({ row: advert }) => {
    const { buy_sell_store, general_store } = useStores();

    if (advert.id === 'WATCH_THIS_SPACE') {
        // This allows for the sliding animation on the Buy/Sell toggle as it pushes
        // an empty item with an item that holds the same height of the toggle container.
        // Also see: buy-sell-table.jsx
        return <div style={{ height: '140px' }} />;
    }

    if (advert.id === 'NO_MATCH_ROW') {
        // Empty row when there is a search_term but no search_results
        return (
            <div className='buy-sell-row__no-match'>
                <Text color='prominent' size='xs'>
                    <Localize i18n_default_text='There are no matching ads.' />
                </Text>
            </div>
        );
    }

    const {
        account_currency,
        advertiser_details,
        counterparty_type,
        local_currency,
        max_order_amount_limit_display,
        min_order_amount_limit_display,
        payment_method_names,
        price_display,
    } = advert;

    const is_my_advert = advert.advertiser_details.id === general_store.advertiser_id;
    const is_buy_advert = counterparty_type === buy_sell.BUY;
    const { name: advertiser_name } = advert.advertiser_details;

    if (isMobile()) {
        return (
            <div className='buy-sell-row'>
                <div
                    className='buy-sell-row__advertiser'
                    onClick={() =>
                        general_store.is_barred || !general_store.is_advertiser
                            ? undefined
                            : buy_sell_store.showAdvertiserPage(advert)
                    }
                >
                    <UserAvatar nickname={advertiser_name} size={32} text_size='s' />
                    <div className='buy-sell-row__advertiser-name'>
                        <div className='buy-sell__cell--container__row'>
                            <Text
                                className='buy-sell-row__advertiser-name--text'
                                size='xs'
                                line_height='m'
                                color='general'
                                weight='bold'
                            >
                                {advertiser_name}
                            </Text>
                            <TradeBadge trade_count={advertiser_details.completed_orders_count} />
                        </div>
                        {advert.advertiser_details.total_completion_rate ? (
                            <Text color='less-prominent' size='xxs'>
                                <Localize
                                    i18n_default_text='Completion rate: {{total_completion_rate}}%'
                                    values={{ total_completion_rate: advert.advertiser_details.total_completion_rate }}
                                />
                            </Text>
                        ) : null}
                    </div>
                    <Icon className='buy-sell-row__advertiser-arrow' icon='IcChevronRightBold' size={16} />
                </div>
                <div className='buy-sell-row__information'>
                    <div className='buy-sell-row__rate'>
                        <Text as='div' color='general' line_height='m' size='xxs'>
                            <Localize
                                i18n_default_text='Rate (1 {{currency}})'
                                values={{ currency: general_store.client.currency }}
                            />
                        </Text>
                        <Text as='div' color='profit-success' line_height='m' size='s' weight='bold'>
                            {price_display} {local_currency}
                        </Text>
                        <Text as='div' color='less-prominent' line_height='m' size='xxs'>
                            <Localize
                                i18n_default_text='Limits {{ min_order }}–{{ max_order }} {{ currency }}'
                                values={{
                                    min_order: min_order_amount_limit_display,
                                    max_order: max_order_amount_limit_display,
                                    currency: account_currency,
                                }}
                            />
                        </Text>
                    </div>
                    <div className='buy-sell-row__payment-methods-list'>
                        {payment_method_names ? (
                            payment_method_names.map((payment_method, key) => {
                                return (
                                    <div className='buy-sell-row__payment-method' key={key}>
                                        {payment_method}
                                    </div>
                                );
                            })
                        ) : (
                            <div className='buy-sell-row__payment-method'>-</div>
                        )}
                    </div>
                    {!is_my_advert && (
                        <Button
                            className='buy-sell-row__button'
                            is_disabled={general_store.is_barred}
                            large
                            onClick={() => buy_sell_store.setSelectedAdvert(advert)}
                            primary
                        >
                            {is_buy_advert ? (
                                <Localize i18n_default_text='Buy {{account_currency}}' values={{ account_currency }} />
                            ) : (
                                <Localize i18n_default_text='Sell {{account_currency}}' values={{ account_currency }} />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Table.Row className='buy-sell__table-row'>
            <Table.Cell>
                <div
                    className={classNames('buy-sell__cell', { 'buy-sell__cell-hover': !general_store.is_barred })}
                    onClick={() =>
                        general_store.is_barred || !general_store.is_advertiser
                            ? undefined
                            : buy_sell_store.showAdvertiserPage(advert)
                    }
                >
                    <UserAvatar nickname={advertiser_name} size={24} text_size='xxs' />
                    <div className='buy-sell__cell--container'>
                        <div className='buy-sell__cell--container__row'>
                            <div
                                className={classNames({
                                    'buy-sell__name': !general_store.is_barred,
                                })}
                            >
                                {advertiser_name}
                            </div>
                            <TradeBadge trade_count={advertiser_details.completed_orders_count} />
                        </div>
                        {!!advert.advertiser_details.total_completion_rate && (
                            <Text color='less-prominent' size='xxs'>
                                <Localize
                                    i18n_default_text='Completion rate: {{total_completion_rate}}%'
                                    values={{ total_completion_rate: advert.advertiser_details.total_completion_rate }}
                                />
                            </Text>
                        )}
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell>
                {min_order_amount_limit_display}&ndash;{max_order_amount_limit_display} {account_currency}
            </Table.Cell>
            <Table.Cell>
                <Text color='profit-success' size='xs' line-height='m' weight='bold'>
                    {price_display} {local_currency}
                </Text>
            </Table.Cell>
            <Table.Cell>
                <div className='buy-sell-row__payment-method'>
                    {payment_method_names ? (
                        payment_method_names.map((payment_method, key) => {
                            return (
                                <div className='buy-sell-row__payment-method--label' key={key}>
                                    <Text color='general' size='xs' line-height='l'>
                                        {payment_method}
                                    </Text>
                                </div>
                            );
                        })
                    ) : (
                        <div className='buy-sell-row__payment-method--label'>
                            <Text color='general' size='xs' line-height='l'>
                                -
                            </Text>
                        </div>
                    )}
                </div>
            </Table.Cell>
            {is_my_advert ? (
                <Table.Cell />
            ) : (
                <Table.Cell className='buy-sell__button'>
                    <Button
                        is_disabled={general_store.is_barred}
                        onClick={() => buy_sell_store.setSelectedAdvert(advert)}
                        primary
                        small
                    >
                        {is_buy_advert
                            ? localize('Buy {{account_currency}}', { account_currency })
                            : localize('Sell {{account_currency}}', { account_currency })}
                    </Button>
                </Table.Cell>
            )}
        </Table.Row>
    );
};

BuySellRow.propTypes = {
    advert: PropTypes.object,
    is_buy: PropTypes.bool,
    setSelectedAdvert: PropTypes.func,
    style: PropTypes.object,
};

export default observer(BuySellRow);
