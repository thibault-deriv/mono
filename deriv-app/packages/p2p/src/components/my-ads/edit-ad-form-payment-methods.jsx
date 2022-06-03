import * as React from 'react';
import { Formik, Field } from 'formik';
import { observer } from 'mobx-react-lite';
import { Autocomplete, Icon, Input, Text } from '@deriv/components';
import { useStores } from 'Stores';
import PaymentMethodCard from '../my-profile/payment-methods/payment-method-card';
import { localize, Localize } from 'Components/i18next';

const EditAdFormPaymentMethods = ({ is_sell_advert, selected_methods, setSelectedMethods }) => {
    const { my_ads_store, my_profile_store } = useStores();

    const style = {
        borderColor: 'var(--brand-secondary)',
        borderWidth: '2px',
    };

    const onClickDeletePaymentMethodItem = value => {
        if (value) {
            my_ads_store.payment_method_names = my_ads_store.payment_method_names.filter(
                payment_method_id => payment_method_id !== value
            );
            setSelectedMethods(selected_methods.filter(i => i !== value));
        }
    };

    const onClickPaymentMethodItem = value => {
        if (value) {
            if (!my_ads_store.payment_method_names.includes(value)) {
                if (my_ads_store.payment_method_names.length < 3) {
                    my_ads_store.payment_method_names.push(value);
                    setSelectedMethods([...selected_methods, value]);
                }
            } else {
                my_ads_store.payment_method_names = my_ads_store.payment_method_names.filter(
                    payment_method_id => payment_method_id !== value
                );
                setSelectedMethods(selected_methods.filter(i => i !== value));
            }
        }
    };

    const onClickPaymentMethodCard = payment_method => {
        if (!my_ads_store.payment_method_ids.includes(payment_method.ID)) {
            if (my_ads_store.payment_method_ids.length < 3) {
                my_ads_store.payment_method_ids.push(payment_method.ID);
                setSelectedMethods([...selected_methods, payment_method.ID]);
            }
        } else {
            my_ads_store.payment_method_ids = my_ads_store.payment_method_ids.filter(
                payment_method_id => payment_method_id !== payment_method.ID
            );
            setSelectedMethods(selected_methods.filter(i => i !== payment_method.ID));
        }
    };

    React.useEffect(() => {
        return () => {
            my_ads_store.payment_method_ids = [];
            my_ads_store.payment_method_names = [];
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (is_sell_advert) {
        if (my_profile_store.advertiser_has_payment_methods) {
            return (
                <>
                    {my_profile_store.advertiser_payment_methods_list.map((payment_method, key) => (
                        <PaymentMethodCard
                            is_vertical_ellipsis_visible={false}
                            key={key}
                            medium
                            onClick={() => onClickPaymentMethodCard(payment_method)}
                            payment_method={payment_method}
                            style={selected_methods.includes(payment_method.ID) ? style : {}}
                        />
                    ))}
                    <PaymentMethodCard
                        is_add={true}
                        label={localize('Payment method')}
                        medium
                        onClickAdd={() => my_ads_store.setShouldShowAddPaymentMethodModal(true)}
                    />
                </>
            );
        }

        return (
            <PaymentMethodCard
                is_add={true}
                label={localize('Payment method')}
                medium
                onClickAdd={() => my_ads_store.setShouldShowAddPaymentMethodModal(true)}
            />
        );
    }

    if (selected_methods.length > 0) {
        return (
            <React.Fragment>
                {selected_methods.map((payment_method, key) => {
                    const method = my_profile_store.getPaymentMethodDisplayName(payment_method);
                    const payment_method_icon = method.replace(' ', '');

                    return (
                        <Formik key={key} enableReinitialize initialValues={{}}>
                            <Field name='payment_method'>
                                {({ field }) => (
                                    <Input
                                        {...field}
                                        className='quick-add-modal--input'
                                        leading_icon={
                                            <Icon
                                                icon={
                                                    payment_method_icon === 'BankTransfer' ||
                                                    payment_method_icon === 'Other'
                                                        ? `IcCashier${payment_method_icon}`
                                                        : 'IcCashierEwallet'
                                                }
                                            />
                                        }
                                        trailing_icon={
                                            <Icon
                                                icon='IcDelete'
                                                onClick={() => {
                                                    onClickDeletePaymentMethodItem(payment_method);
                                                }}
                                            />
                                        }
                                        type='text'
                                        value={method}
                                    />
                                )}
                            </Field>
                        </Formik>
                    );
                })}
                {my_ads_store.payment_method_names.length < 3 && (
                    <Formik enableReinitialize initialValues={{ payment_method: '' }}>
                        {() => (
                            <Field name='payment_method'>
                                {({ field }) => (
                                    <div className='p2p-my-ads--border'>
                                        <Autocomplete
                                            {...field}
                                            autoComplete='off' // prevent chrome autocomplete
                                            data-lpignore='true'
                                            has_updating_list={false}
                                            is_alignment_top
                                            label={
                                                <React.Fragment>
                                                    <Icon icon='IcAddCircle' size={14} />
                                                    <Text color='less-prominent' size='xs'>
                                                        <Localize i18n_default_text='Add' />
                                                    </Text>
                                                </React.Fragment>
                                            }
                                            list_items={my_profile_store.payment_methods_list}
                                            list_portal_id='deriv_app'
                                            onItemSelection={({ value }) => {
                                                onClickPaymentMethodItem(value);
                                            }}
                                            required
                                            trailing_icon={<></>}
                                            type='text'
                                        />
                                    </div>
                                )}
                            </Field>
                        )}
                    </Formik>
                )}
            </React.Fragment>
        );
    }

    return (
        <Formik enableReinitialize initialValues={{ payment_method: '' }}>
            {({ setFieldValue }) => (
                <Field name='payment_method'>
                    {({ field }) => (
                        <div className='p2p-my-ads--border'>
                            <Autocomplete
                                {...field}
                                autoComplete='off' // prevent chrome autocomplete
                                data-lpignore='true'
                                has_updating_list={false}
                                is_alignment_top
                                label={
                                    <React.Fragment>
                                        <Icon icon='IcAddCircle' size={14} />
                                        <Text color='less-prominent' size='xs'>
                                            <Localize i18n_default_text='Add' />
                                        </Text>
                                    </React.Fragment>
                                }
                                list_items={my_profile_store.payment_methods_list}
                                list_portal_id='deriv_app'
                                onItemSelection={({ text, value }) => {
                                    setFieldValue('payment_method', value ? text : '');
                                    onClickPaymentMethodItem(value);
                                }}
                                required
                                trailing_icon={<></>}
                                type='text'
                            />
                        </div>
                    )}
                </Field>
            )}
        </Formik>
    );
};

export default observer(EditAdFormPaymentMethods);
