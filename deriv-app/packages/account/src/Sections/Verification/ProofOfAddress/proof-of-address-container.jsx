import PropTypes from 'prop-types';
import React from 'react';
import { Loading, useStateCallback } from '@deriv/components';
import { WS } from '@deriv/shared';
import Expired from 'Components/poa-expired';
import Unverified from 'Components/poa-unverified';
import NeedsReview from 'Components/poa-needs-review';
import Submitted from 'Components/poa-submitted';
import Verified from 'Components/poa-verified';
import NotRequired from 'Components/poa-not-required';
import PoaStatusCodes from 'Components/poa-status-codes';
import ProofOfAddressForm from './proof-of-address-form.jsx';
import { populateVerificationStatus } from '../Helpers/verification';

const ProofOfAddressContainer = ({ is_mx_mlt, is_switching, refreshNotifications }) => {
    const [is_loading, setIsLoading] = React.useState(true);
    const [authentication_status, setAuthenticationStatus] = useStateCallback({
        allow_document_upload: false,
        allow_poi_resubmission: false,
        needs_poi: false,
        needs_poa: false,
        has_poi: false,
        resubmit_poa: false,
        has_submitted_poa: false,
        document_status: null,
        is_age_verified: false,
    });

    React.useEffect(() => {
        if (!is_switching) {
            WS.authorized.getAccountStatus().then(response => {
                const { get_account_status } = response;
                const {
                    allow_document_upload,
                    allow_poa_resubmission,
                    needs_poi,
                    needs_poa,
                    document_status,
                    is_age_verified,
                } = populateVerificationStatus(get_account_status);
                const has_submitted_poa = document_status === PoaStatusCodes.pending && !allow_poa_resubmission;

                setAuthenticationStatus(
                    {
                        ...authentication_status,
                        ...{
                            allow_document_upload,
                            allow_poa_resubmission,
                            needs_poi,
                            needs_poa,
                            document_status,
                            has_submitted_poa,
                            is_age_verified,
                        },
                    },
                    () => {
                        setIsLoading(false);
                        refreshNotifications();
                    }
                );
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_switching]);

    const handleResubmit = () => {
        setAuthenticationStatus({ ...authentication_status, ...{ resubmit_poa: true } });
    };

    const onSubmit = ({ needs_poi }) => {
        setAuthenticationStatus({ ...authentication_status, ...{ has_submitted_poa: true, needs_poi } });
    };

    const {
        allow_document_upload,
        allow_poa_resubmission,
        document_status,
        needs_poi,
        resubmit_poa,
        has_submitted_poa,
        is_age_verified,
    } = authentication_status;

    if (is_loading) return <Loading is_fullscreen={false} className='account__initial-loader' />;
    if (
        !allow_document_upload ||
        (!is_age_verified && !allow_poa_resubmission && document_status === 'none' && is_mx_mlt)
    )
        return <NotRequired />;
    if (has_submitted_poa) return <Submitted needs_poi={needs_poi} />;
    if (resubmit_poa || allow_poa_resubmission) {
        return <ProofOfAddressForm onSubmit={() => onSubmit({ needs_poi })} />;
    }

    switch (document_status) {
        case PoaStatusCodes.none:
            return <ProofOfAddressForm onSubmit={() => onSubmit({ needs_poi })} />;
        case PoaStatusCodes.pending:
            return <NeedsReview needs_poi={needs_poi} />;
        case PoaStatusCodes.verified:
            return <Verified needs_poi={needs_poi} />;
        case PoaStatusCodes.expired:
            return <Expired onClick={handleResubmit} />;
        case PoaStatusCodes.rejected:
            return <Unverified />;
        case PoaStatusCodes.suspected:
            return <Unverified />;
        default:
            return null;
    }
};

ProofOfAddressContainer.propTypes = {
    is_mx_mlt: PropTypes.bool,
    is_switching: PropTypes.bool,
    refreshNotifications: PropTypes.func,
};

export default ProofOfAddressContainer;
