import React from 'react';
import { DesktopWrapper, Icon, Loading, MobileFullPageModal, MobileWrapper, Text } from '@deriv/components';
import { observer } from 'mobx-react-lite';
import { my_profile_tabs } from 'Constants/my-profile-tabs';
import { useStores } from 'Stores';
import MyProfileStatsTable from './my-profile-stats-table';
import MyProfileSeparatorContainer from '../my-profile-separator-container';
import { Localize, localize } from 'Components/i18next';
import MyProfilePrivacy from './my-profile-privacy';

const MyStats = () => {
    const { my_profile_store } = useStores();
    const [should_show_stats_and_ratings, setShouldShowStatsAndRatings] = React.useState(false);

    if (my_profile_store.is_loading) {
        return <Loading is_fullscreen={false} />;
    }

    return (
        <React.Fragment>
            <MobileFullPageModal
                height_offset='80px'
                is_flex
                is_modal_open={should_show_stats_and_ratings}
                page_header_text={localize('Stats')}
                pageHeaderReturnFn={() => setShouldShowStatsAndRatings(false)}
            >
                <MyProfileStatsTable />
            </MobileFullPageModal>
            <DesktopWrapper>
                <MyProfileStatsTable />
            </DesktopWrapper>
            <MobileWrapper>
                <MyProfilePrivacy />
                <MyProfileSeparatorContainer.Line className='my-profile-stats-separator' />
                <div className='my-profile__navigation' onClick={() => setShouldShowStatsAndRatings(true)}>
                    <Text color='prominent' size='xxs'>
                        <Localize i18n_default_text='Stats' />
                    </Text>
                    <Icon icon='IcChevronRight' />
                </div>
                <MyProfileSeparatorContainer.Line className='my-profile-stats-separator' />
                <div
                    className='my-profile__navigation'
                    onClick={() => my_profile_store.setActiveTab(my_profile_tabs.PAYMENT_METHODS)}
                >
                    <Text color='prominent' size='xxs'>
                        <Localize i18n_default_text='Payment methods' />
                    </Text>
                    <Icon icon='IcChevronRight' />
                </div>
                <MyProfileSeparatorContainer.Line className='my-profile-stats-separator' />
                <div
                    className='my-profile__navigation'
                    onClick={() => my_profile_store.setActiveTab(my_profile_tabs.AD_TEMPLATE)}
                >
                    <Text color='prominent' size='xxs'>
                        <Localize i18n_default_text='Ad details' />
                    </Text>
                    <Icon icon='IcChevronRight' />
                </div>
                <MyProfileSeparatorContainer.Line className='my-profile-stats-separator' />
            </MobileWrapper>
        </React.Fragment>
    );
};

export default observer(MyStats);
