import React from 'react';
import { Text } from '@deriv/components';
import { getFormattedText } from '@deriv/shared';
import { Localize } from 'Components/i18next';
import { useStores } from 'Stores';

const BuySellFormReceiveAmount = () => {
    const { buy_sell_store } = useStores();

    return (
        <React.Fragment>
            <Text as='p' color='less-prominent' line_height='m' size='xxs'>
                {buy_sell_store?.is_sell_advert ? (
                    <Localize i18n_default_text="You'll receive" />
                ) : (
                    <Localize i18n_default_text="You'll send" />
                )}
            </Text>
            <Text as='p' color='general' line_height='m' size='xs' weight='bold'>
                {getFormattedText(buy_sell_store?.receive_amount, buy_sell_store?.advert?.local_currency)}
            </Text>
        </React.Fragment>
    );
};

export default BuySellFormReceiveAmount;
