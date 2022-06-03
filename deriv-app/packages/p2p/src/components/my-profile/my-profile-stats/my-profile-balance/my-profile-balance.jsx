import * as React from 'react';
import { Button, Icon, Modal, Money, Text } from '@deriv/components';
import { isMobile } from '@deriv/shared';
import { observer } from 'mobx-react-lite';
import { useUpdatingAvailableBalance } from 'Components/hooks';
import { Localize, localize } from 'Components/i18next';
import { useStores } from 'Stores';

const MyProfileBalance = () => {
    const { general_store, my_profile_store } = useStores();
    const [is_balance_tooltip_open, setIsBalanceTooltipOpen] = React.useState(false);
    const available_balance = useUpdatingAvailableBalance(my_profile_store.advertiser_info.balance_available);

    return (
        <div className='my-profile-balance'>
            <Modal has_close_icon={false} is_open={is_balance_tooltip_open} small title={localize('Deriv P2P Balance')}>
                <Modal.Body>
                    <Localize i18n_default_text='Deriv P2P balance = deposits that can’t be reversed (bank transfers, etc.) + a portion of deposits that might be reversed (credit card payments, etc.)' />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        has_effect
                        text={localize('Ok')}
                        onClick={() => setIsBalanceTooltipOpen(false)}
                        primary
                        large
                    />
                </Modal.Footer>
            </Modal>
            <div className='my-profile-balance--column'>
                <div className='my-profile-balance--row'>
                    <Text color='less-prominent' line_height='m' size={isMobile() ? 'xxxs' : 'xs'}>
                        <Localize i18n_default_text='Available Deriv P2P balance' />
                    </Text>
                    <Icon
                        className='my-profile-balance--icon'
                        icon='IcInfoOutline'
                        onClick={() => setIsBalanceTooltipOpen(true)}
                        size={16}
                    />
                </div>
                <Text className='my-profile-balance__amount' color='prominent' line_height='m' size='m' weight='bold'>
                    <Money amount={available_balance} currency={general_store.client.currency} show_currency />
                </Text>
            </div>
        </div>
    );
};

export default observer(MyProfileBalance);
