import React from 'react';
import { observer } from 'mobx-react-lite';
import { Field, Form, Formik } from 'formik';
import { Button, Input, Loading, Modal, Text } from '@deriv/components';
import { Localize, localize } from 'Components/i18next';
import { useStores } from 'Stores';
import CancelEditPaymentMethodModal from './cancel-edit-payment-method-modal';

const EditPaymentMethodForm = () => {
    const { my_profile_store } = useStores();

    const validateFields = values => {
        const errors = {};
        const no_symbols_regex = /^[a-zA-Z0-9\\\s.@_+-]+$/;
        const no_symbols_message = localize(
            'This field can only include letters, numbers, spaces, and any of these symbols: -+._@'
        );
        const max_characters_error_message = localize('This field has exceeded maximum length of 200 characters.');

        if (values.account) {
            if (!no_symbols_regex.test(values.account)) {
                errors.account = no_symbols_message;
            } else if (values.account.length > 200) {
                errors.account = max_characters_error_message;
            }
        }

        if (values.bank_name) {
            if (!no_symbols_regex.test(values.bank_name)) {
                errors.bank_name = no_symbols_message;
            } else if (values.bank_name.length > 200) {
                errors.bank_name = max_characters_error_message;
            }
        }

        if (values.branch) {
            if (!no_symbols_regex.test(values.branch)) {
                errors.branch = no_symbols_message;
            } else if (values.branch.length > 200) {
                errors.branch = max_characters_error_message;
            }
        }

        if (values.instructions) {
            if (!no_symbols_regex.test(values.instructions)) {
                errors.instructions = no_symbols_message;
            } else if (values.instructions.length > 200) {
                errors.instructions = max_characters_error_message;
            }
        }

        if (values.name) {
            if (!no_symbols_regex.test(values.name)) {
                errors.name = no_symbols_message;
            } else if (values.name.length > 200) {
                errors.name = max_characters_error_message;
            }
        }

        if (values.bank_code) {
            if (!no_symbols_regex.test(values.bank_code)) {
                errors.bank_code = no_symbols_message;
            } else if (values.bank_code.length > 200) {
                errors.bank_code = max_characters_error_message;
            }
        }

        return errors;
    };

    React.useEffect(() => {
        return () => {
            my_profile_store.setSelectedPaymentMethod('');
            my_profile_store.setSelectedPaymentMethodDisplayName('');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!my_profile_store.payment_method_info) {
        return <Loading is_fullscreen={false} />;
    }

    return (
        <React.Fragment>
            <CancelEditPaymentMethodModal />
            <Formik
                enableReinitialize
                initialValues={my_profile_store.initial_values}
                onSubmit={my_profile_store.updatePaymentMethod}
                validate={validateFields}
            >
                {({ dirty, handleChange, isSubmitting, errors }) => {
                    return (
                        <Form className='add-payment-method-form__form'>
                            <div className='add-payment-method-form__form-wrapper'>
                                <Field name='choose_payment_method'>
                                    {({ field }) => (
                                        <Input
                                            {...field}
                                            disabled
                                            type='field'
                                            label={
                                                <Text color='prominent' size='xs'>
                                                    <Localize i18n_default_text='Choose your payment method' />
                                                </Text>
                                            }
                                            value={my_profile_store.payment_method_to_edit.display_name}
                                            required
                                        />
                                    )}
                                </Field>
                                {Object.values(my_profile_store.selected_payment_method_fields).map(
                                    (payment_method_field, key) => {
                                        return (
                                            <Field
                                                name={payment_method_field[0]}
                                                id={payment_method_field[0]}
                                                key={key}
                                            >
                                                {({ field }) => (
                                                    <Input
                                                        {...field}
                                                        data-lpignore='true'
                                                        error={errors[payment_method_field[0]]}
                                                        type={
                                                            payment_method_field[0] === 'instructions'
                                                                ? 'textarea'
                                                                : payment_method_field[1].type
                                                        }
                                                        label={payment_method_field[1].display_name}
                                                        className='add-payment-method-form__payment-method-field'
                                                        onChange={handleChange}
                                                        name={payment_method_field[0]}
                                                        required={!!payment_method_field[1].required}
                                                    />
                                                )}
                                            </Field>
                                        );
                                    }
                                )}
                            </div>
                            <div className='add-payment-method-form__buttons'>
                                <Button
                                    secondary
                                    large
                                    onClick={() => {
                                        if (dirty) {
                                            my_profile_store.setIsCancelEditPaymentMethodModalOpen(true);
                                        } else {
                                            my_profile_store.setPaymentMethodToEdit(null);
                                            my_profile_store.setShouldShowEditPaymentMethodForm(false);
                                        }
                                    }}
                                    type='button'
                                >
                                    <Localize i18n_default_text='Cancel' />
                                </Button>
                                <Button
                                    className='add-payment-method-form__buttons--add'
                                    primary
                                    large
                                    is_disabled={isSubmitting || !dirty}
                                >
                                    <Localize i18n_default_text='Save changes' />
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
            <Modal
                is_open={my_profile_store.should_show_add_payment_method_error_modal}
                small
                has_close_icon={false}
                title={localize("Something's not right")}
            >
                <Modal.Body>
                    <Text color='prominent' size='xs'>
                        {my_profile_store.add_payment_method_error_message}
                    </Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        has_effect
                        text={localize('Ok')}
                        onClick={() => my_profile_store.setShouldShowAddPaymentMethodErrorModal(false)}
                        primary
                        large
                    />
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};

export default observer(EditPaymentMethodForm);
