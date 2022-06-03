import { action, observable } from 'mobx';
import { getDecimalPlaces } from '@deriv/shared';
import { localize } from 'Components/i18next';
import { buy_sell } from 'Constants/buy-sell';
import BaseStore from 'Stores/base_store';
import { countDecimalPlaces } from 'Utils/string';
import { decimalValidator, lengthValidator, textValidator } from 'Utils/validations';
import { requestWS } from 'Utils/websocket';

export default class MyAdsStore extends BaseStore {
    @observable activate_deactivate_error_message = '';
    @observable advert_details = null;
    @observable adverts = [];
    @observable adverts_archive_period = null;
    @observable api_error = '';
    @observable api_error_message = '';
    @observable api_table_error_message = '';
    @observable available_balance = null;
    @observable contact_info = '';
    @observable default_advert_description = '';
    @observable delete_error_message = '';
    @observable edit_ad_form_error = '';
    @observable error_message = '';
    @observable has_more_items_to_load = false;
    @observable has_missing_payment_methods = false;
    @observable is_ad_created_modal_visible = false;
    @observable is_ad_exceeds_daily_limit_modal_open = false;
    @observable is_api_error_modal_visible = false;
    @observable is_delete_modal_open = false;
    @observable is_edit_ad_error_modal_visible = false;
    @observable is_form_loading = false;
    @observable is_quick_add_error_modal_open = false;
    @observable is_quick_add_modal_open = false;
    @observable is_table_loading = false;
    @observable is_loading = false;
    @observable item_offset = 0;
    @observable p2p_advert_information = {};
    @observable selected_ad_id = '';
    @observable selected_advert = null;
    @observable should_show_add_payment_method = false;
    @observable should_show_add_payment_method_modal = false;
    @observable show_ad_form = false;
    @observable show_edit_ad_form = false;
    @observable update_payment_methods_error_message = '';

    payment_method_ids = [];
    payment_method_names = [];

    @action.bound
    getAccountStatus() {
        this.setIsLoading(true);

        if (!this.root_store.general_store.is_advertiser) {
            requestWS({ get_account_status: 1 }).then(response => {
                if (!response.error) {
                    const { get_account_status } = response;
                    const { status } = get_account_status.authentication.identity;
                    this.root_store.general_store.setPoiStatus(status);
                } else {
                    this.setErrorMessage(response.error);
                }
                this.setIsLoading(false);
            });
        } else {
            this.setIsLoading(false);
        }
    }

    @action.bound
    getAdvertInfo() {
        this.setIsFormLoading(true);

        requestWS({
            p2p_advert_info: 1,
            id: this.selected_ad_id,
        }).then(response => {
            if (!response.error) {
                const { p2p_advert_info } = response;
                if (!p2p_advert_info.payment_method_names)
                    p2p_advert_info.payment_method_names = this.payment_method_names;
                if (!p2p_advert_info.payment_method_details)
                    p2p_advert_info.payment_method_details = this.payment_method_details;
                this.setP2pAdvertInformation(p2p_advert_info);
            }
            this.setIsFormLoading(false);
        });
    }

    @action.bound
    getAdvertiserInfo() {
        this.setIsFormLoading(true);

        requestWS({
            p2p_advertiser_info: 1,
        }).then(response => {
            if (!response.error) {
                const { p2p_advertiser_info } = response;
                this.setContactInfo(p2p_advertiser_info.contact_info);
                this.setDefaultAdvertDescription(p2p_advertiser_info.default_advert_description);
                this.setAvailableBalance(p2p_advertiser_info.balance_available);
            } else {
                this.setContactInfo('');
                this.setDefaultAdvertDescription('');
            }
            this.setIsFormLoading(false);
        });
    }

    @action.bound
    getWebsiteStatus(createAd = () => {}, setSubmitting) {
        requestWS({ website_status: 1 }).then(response => {
            if (response.error) {
                this.setApiErrorMessage(response.error.message);
                setSubmitting(false);
            } else {
                const { p2p_config } = response.website_status;
                this.setAdvertsArchivePeriod(p2p_config.adverts_archive_period);
                createAd();
            }
        });
    }

    @action.bound
    handleSubmit(values, { setSubmitting }) {
        this.setApiErrorMessage('');

        const is_sell_ad = values.type === buy_sell.SELL;
        const should_not_show_auto_archive_message = localStorage.getItem('should_not_show_auto_archive_message');

        const create_advert = {
            p2p_advert_create: 1,
            type: values.type,
            amount: Number(values.offer_amount),
            max_order_amount: Number(values.max_transaction),
            min_order_amount: Number(values.min_transaction),
            rate: Number(values.price_rate),
            ...(this.payment_method_names.length > 0 && !is_sell_ad
                ? { payment_method_names: this.payment_method_names }
                : {}),
            ...(this.payment_method_ids.length > 0 && is_sell_ad
                ? { payment_method_ids: this.payment_method_ids }
                : {}),
        };

        if (values.contact_info && is_sell_ad) {
            create_advert.contact_info = values.contact_info;
        }

        if (values.default_advert_description) {
            create_advert.description = values.default_advert_description;
        }

        const createAd = () => {
            requestWS(create_advert).then(response => {
                // If we get an error we should let the user submit the form again else we just go back to the list of ads
                if (response.error) {
                    this.setCreateAdErrorCode(response.error.code);
                    this.setApiErrorMessage(response.error.message);
                    setSubmitting(false);
                } else if (should_not_show_auto_archive_message !== 'true' && this.adverts_archive_period) {
                    this.setAdvertDetails(response.p2p_advert_create);
                    setTimeout(() => {
                        if (!this.is_api_error_modal_visible) {
                            this.setIsAdCreatedModalVisible(true);
                        }
                    }, 200);
                } else if (!this.is_api_error_modal_visible && !this.is_ad_created_modal_visible) {
                    if (!response.p2p_advert_create.is_visible) {
                        this.setAdvertDetails(response.p2p_advert_create);
                        this.setIsAdExceedsDailyLimitModalOpen(true);
                    }
                    this.setShowAdForm(false);
                }
            });
        };

        if (should_not_show_auto_archive_message !== 'true') {
            this.getWebsiteStatus(createAd, setSubmitting);
        } else {
            createAd();
        }
    }

    @action.bound
    hideQuickAddModal() {
        this.setIsQuickAddModalOpen(false);
        this.setSelectedAdId(undefined);
    }

    @action.bound
    onClickActivateDeactivate(id, is_ad_active, setIsAdvertActive) {
        if (!this.root_store.general_store.is_barred) {
            requestWS({ p2p_advert_update: 1, id, is_active: is_ad_active ? 0 : 1 }).then(response => {
                if (response.error) {
                    this.setActivateDeactivateErrorMessage(response.error.message);
                } else {
                    setIsAdvertActive(!!response.p2p_advert_update.is_active);
                }
                this.setSelectedAdId('');
            });
        }
    }

    @action.bound
    onClickCancel() {
        this.setSelectedAdId('');
        this.setShouldShowPopup(false);
    }

    @action.bound
    onClickConfirm(showError) {
        requestWS({ p2p_advert_update: 1, id: this.selected_ad_id, delete: 1 }).then(response => {
            if (response.error) {
                showError({ error_message: response.error.message });
            } else {
                // remove the deleted ad from the list of items
                const updated_items = this.adverts.filter(ad => ad.id !== response.p2p_advert_update.id);
                this.setAdverts(updated_items);
                this.setShouldShowPopup(false);
            }
        });
    }

    @action.bound
    onClickCreate() {
        this.setShowAdForm(true);
    }

    @action.bound
    onClickDelete(id) {
        if (!this.root_store.general_store.is_barred) {
            this.setSelectedAdId(id);
            this.setIsDeleteModalOpen(true);
        }
    }

    @action.bound
    onClickEdit(id) {
        if (!this.root_store.general_store.is_barred) {
            this.setSelectedAdId(id);
            this.setShowEditAdForm(true);
            this.getAdvertInfo();
        }
    }

    @action.bound
    onClickSaveEditAd(values, { setSubmitting }) {
        const is_sell_ad = values.type === buy_sell.SELL;

        const update_advert = {
            p2p_advert_update: 1,
            id: this.selected_ad_id,
            max_order_amount: Number(values.max_transaction),
            min_order_amount: Number(values.min_transaction),
            rate: Number(values.price_rate),
            ...(this.payment_method_names.length > 0 && !is_sell_ad
                ? { payment_method_names: this.payment_method_names }
                : {}),
            ...(this.payment_method_ids.length > 0 && is_sell_ad
                ? { payment_method_ids: this.payment_method_ids }
                : {}),
        };

        if (values.contact_info && is_sell_ad) {
            update_advert.contact_info = values.contact_info;
        }

        if (values.description) {
            update_advert.description = values.description;
        }

        requestWS(update_advert).then(response => {
            // If there's an error, let the user submit the form again.
            if (response.error) {
                setSubmitting(false);
                this.setEditAdFormError(response.error.message);
                this.setIsEditAdErrorModalVisible(true);
            } else {
                this.setShowEditAdForm(false);
            }
        });
    }

    @action.bound
    onClickUpdatePaymentMethods(id, is_buy_advert) {
        requestWS({
            p2p_advert_update: 1,
            id,
            ...(this.payment_method_names.length > 0 && is_buy_advert
                ? { payment_method_names: this.payment_method_names }
                : {}),
            ...(this.payment_method_ids.length > 0 && !is_buy_advert
                ? { payment_method_ids: this.payment_method_ids }
                : {}),
        }).then(response => {
            if (!response.error) {
                this.setAdverts([]);
                this.loadMoreAds({ startIndex: 0 });
                this.hideQuickAddModal();
            } else {
                this.setUpdatePaymentMethodsErrorMessage(response.error.message);
                this.setIsQuickAddModalOpen(false);
                this.setIsQuickAddErrorModalOpen(true);
            }
        });
    }

    @action.bound
    loadMoreAds({ startIndex }, is_initial_load = false) {
        if (is_initial_load) {
            this.setIsTableLoading(true);
            this.setApiErrorMessage('');
        }

        const { list_item_limit } = this.root_store.general_store;

        return new Promise(resolve => {
            requestWS({
                p2p_advertiser_adverts: 1,
                offset: startIndex,
                limit: list_item_limit,
            }).then(response => {
                if (!response.error) {
                    const { list } = response.p2p_advertiser_adverts;
                    this.setHasMoreItemsToLoad(list.length >= list_item_limit);
                    this.setAdverts(this.adverts.concat(list));
                    this.setMissingPaymentMethods(!!list.find(payment_method => !payment_method.payment_method_names));
                } else if (response.error.code === 'PermissionDenied') {
                    this.root_store.general_store.setIsBlocked(true);
                } else {
                    this.setApiErrorMessage(response.error.message);
                }

                this.setIsTableLoading(false);
                resolve();
            });
        });
    }

    @action.bound
    restrictLength = (e, handleChange) => {
        // typing more than 15 characters will break the layout
        // max doesn't disable typing, so we will use this to restrict length
        const max_characters = 15;
        if (e.target.value.length > max_characters) {
            e.target.value = e.target.value.slice(0, max_characters);
            return;
        }
        handleChange(e);
    };

    @action.bound
    showQuickAddModal(advert) {
        this.setSelectedAdId(advert);
        this.setIsQuickAddModalOpen(true);
    }

    @action.bound
    setActivateDeactivateErrorMessage(activate_deactivate_error_message) {
        this.activate_deactivate_error_message = activate_deactivate_error_message;
    }

    @action.bound
    setAdvertDetails(advert_details) {
        this.advert_details = advert_details;
    }

    @action.bound
    setAdverts(adverts) {
        this.adverts = adverts;
    }

    @action.bound
    setAdvertsArchivePeriod(adverts_archive_period) {
        this.adverts_archive_period = adverts_archive_period;
    }

    @action.bound
    setApiError(api_error) {
        this.api_error = api_error;
    }

    @action.bound
    setApiErrorMessage(api_error_message) {
        this.api_error_message = api_error_message;
    }

    @action.bound
    setApiTableErrorMessage(api_table_error_message) {
        this.api_table_error_message = api_table_error_message;
    }

    @action.bound
    setAvailableBalance(available_balance) {
        this.available_balance = available_balance;
    }

    @action.bound
    setContactInfo(contact_info) {
        this.contact_info = contact_info;
    }

    @action.bound
    setCreateAdErrorCode(create_ad_error_code) {
        this.create_ad_error_code = create_ad_error_code;
    }

    @action.bound
    setDefaultAdvertDescription(default_advert_description) {
        this.default_advert_description = default_advert_description;
    }

    @action.bound
    setDeleteErrorMessage(delete_error_message) {
        this.delete_error_message = delete_error_message;
    }

    @action.bound
    setEditAdFormError(edit_ad_form_error) {
        this.edit_ad_form_error = edit_ad_form_error;
    }

    @action.bound
    setErrorMessage(error_message) {
        this.error_message = error_message;
    }

    @action.bound
    setHasMoreItemsToLoad(has_more_items_to_load) {
        this.has_more_items_to_load = has_more_items_to_load;
    }

    @action.bound
    setMissingPaymentMethods(has_missing_payment_methods) {
        this.has_missing_payment_methods = has_missing_payment_methods;
    }

    @action.bound
    setIsAdCreatedModalVisible(is_ad_created_modal_visible) {
        this.is_ad_created_modal_visible = is_ad_created_modal_visible;
    }

    @action.bound
    setIsAdExceedsDailyLimitModalOpen(is_ad_exceeds_daily_limit_modal_open) {
        this.is_ad_exceeds_daily_limit_modal_open = is_ad_exceeds_daily_limit_modal_open;
    }

    @action.bound
    setIsApiErrorModalVisible(is_api_error_modal_visible) {
        this.is_api_error_modal_visible = is_api_error_modal_visible;
    }

    @action.bound
    setIsDeleteModalOpen(is_delete_modal_open) {
        this.is_delete_modal_open = is_delete_modal_open;
    }

    @action.bound
    setIsEditAdErrorModalVisible(is_edit_ad_error_modal_visible) {
        this.is_edit_ad_error_modal_visible = is_edit_ad_error_modal_visible;
    }

    @action.bound
    setIsFormLoading(is_form_loading) {
        this.is_form_loading = is_form_loading;
    }

    @action.bound
    setIsLoading(is_loading) {
        this.is_loading = is_loading;
    }

    @action.bound
    setIsQuickAddErrorModalOpen(is_quick_add_error_modal_open) {
        this.is_quick_add_error_modal_open = is_quick_add_error_modal_open;
    }

    @action.bound
    setIsQuickAddModalOpen(is_quick_add_modal_open) {
        this.is_quick_add_modal_open = is_quick_add_modal_open;
    }

    @action.bound
    setIsTableLoading(is_table_loading) {
        this.is_table_loading = is_table_loading;
    }

    @action.bound
    setItemOffset(item_offset) {
        this.item_offset = item_offset;
    }

    @action.bound
    setP2pAdvertInformation(p2p_advert_information) {
        this.p2p_advert_information = p2p_advert_information;
    }

    @action.bound
    setSelectedAdId(selected_ad_id) {
        this.selected_ad_id = selected_ad_id;
    }

    @action.bound
    setSelectedAdvert(selected_advert) {
        this.selected_advert = selected_advert;
    }

    @action.bound
    setShouldShowAddPaymentMethod(should_show_add_payment_method) {
        this.should_show_add_payment_method = should_show_add_payment_method;
    }

    @action.bound
    setShouldShowAddPaymentMethodModal(should_show_add_payment_method_modal) {
        this.should_show_add_payment_method_modal = should_show_add_payment_method_modal;
    }

    @action.bound
    setShowAdForm(show_ad_form) {
        this.show_ad_form = show_ad_form;
    }

    @action.bound
    setShowEditAdForm(show_edit_ad_form) {
        this.show_edit_ad_form = show_edit_ad_form;
    }

    @action.bound
    setUpdatePaymentMethodsErrorMessage(update_payment_methods_error_message) {
        this.update_payment_methods_error_message = update_payment_methods_error_message;
    }

    @action.bound
    validateCreateAdForm(values) {
        const validations = {
            default_advert_description: [v => !v || lengthValidator(v), v => !v || textValidator(v)],
            max_transaction: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.min_transaction ? +v >= values.min_transaction : true),
            ],
            min_transaction: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.max_transaction ? +v <= values.max_transaction : true),
            ],
            offer_amount: [
                v => !!v,
                v => !isNaN(v),
                v => (values.type === buy_sell.SELL ? v <= this.available_balance : !!v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
                v => (values.min_transaction ? +v >= values.min_transaction : true),
                v => (values.max_transaction ? +v >= values.max_transaction : true),
            ],
            price_rate: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= this.root_store.general_store.client.local_currency_config.decimal_places,
            ],
        };

        if (values.type === buy_sell.SELL) {
            validations.contact_info = [v => !!v, v => textValidator(v), v => lengthValidator(v)];
        }

        const mapped_key = {
            contact_info: localize('Contact details'),
            default_advert_description: localize('Instructions'),
            max_transaction: localize('Max limit'),
            min_transaction: localize('Min limit'),
            offer_amount: localize('Amount'),
            price_rate: localize('Fixed rate'),
        };

        const getCommonMessages = field_name => [localize('{{field_name}} is required', { field_name })];

        const getContactInfoMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
            localize('{{field_name}} has exceeded maximum length', { field_name }),
        ];

        const getDefaultAdvertDescriptionMessages = field_name => [
            localize('{{field_name}} has exceeded maximum length', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
        ];

        const getOfferAmountMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Max available amount is {{value}}', { value: this.available_balance }),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not be below Min limit', { field_name }),
            localize('{{field_name}} should not be below Max limit', { field_name }),
        ];

        const getMaxTransactionLimitMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not be below Min limit', { field_name }),
        ];

        const getMinTransactionLimitMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not exceed Max limit', { field_name }),
        ];

        const getPriceRateMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
        ];

        const errors = {};

        Object.entries(validations).forEach(([key, rules]) => {
            const error_index = rules.findIndex(v => !v(values[key]));
            if (error_index !== -1) {
                switch (key) {
                    case 'contact_info':
                        errors[key] = getContactInfoMessages(mapped_key[key])[error_index];
                        break;
                    case 'default_advert_description':
                        errors[key] = getDefaultAdvertDescriptionMessages(mapped_key[key])[error_index];
                        break;
                    case 'offer_amount':
                        errors[key] = getOfferAmountMessages(mapped_key[key])[error_index];
                        break;
                    case 'max_transaction':
                        errors[key] = getMaxTransactionLimitMessages(mapped_key[key])[error_index];
                        break;
                    case 'min_transaction':
                        errors[key] = getMinTransactionLimitMessages(mapped_key[key])[error_index];
                        break;
                    case 'price_rate':
                        errors[key] = getPriceRateMessages(mapped_key[key])[error_index];
                        break;
                    default:
                        errors[key] = getCommonMessages(mapped_key[key])[error_index];
                }
            }
        });

        if (Object.values(errors).includes('Enter a valid amount')) {
            Object.entries(errors).forEach(([key, value]) => {
                errors[key] = value === 'Enter a valid amount' ? value : undefined;
            });
        }

        return errors;
    }

    @action.bound
    validateEditAdForm(values) {
        const validations = {
            description: [v => !v || lengthValidator(v), v => !v || textValidator(v)],
            max_transaction: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.min_transaction ? +v >= values.min_transaction : true),
            ],
            min_transaction: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.max_transaction ? +v <= values.max_transaction : true),
            ],
            // Offer amount disabled for edit ads
            // offer_amount: [
            //     v => !!v,
            //     v => !isNaN(v),
            //     v => (values.type === buy_sell.SELL ? v <= this.available_balance : !!v),
            //     v =>
            //         v > 0 &&
            //         decimalValidator(v) &&
            //         countDecimalPlaces(v) <= getDecimalPlaces(this.root_store.general_store.client.currency),
            //     v => (values.min_transaction ? +v >= values.min_transaction : true),
            //     v => (values.max_transaction ? +v >= values.max_transaction : true),
            // ],
            price_rate: [
                v => !!v,
                v => !isNaN(v),
                v =>
                    v > 0 &&
                    decimalValidator(v) &&
                    countDecimalPlaces(v) <= this.root_store.general_store.client.local_currency_config.decimal_places,
            ],
        };

        if (values.type === buy_sell.SELL) {
            validations.contact_info = [v => !!v, v => textValidator(v), v => lengthValidator(v)];
        }

        const mapped_key = {
            contact_info: localize('Contact details'),
            description: localize('Instructions'),
            max_transaction: localize('Max limit'),
            min_transaction: localize('Min limit'),
            offer_amount: localize('Amount'),
            price_rate: localize('Fixed rate'),
        };

        const getCommonMessages = field_name => [localize('{{field_name}} is required', { field_name })];

        const getContactInfoMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
            localize('{{field_name}} has exceeded maximum length', { field_name }),
        ];

        const getDefaultAdvertDescriptionMessages = field_name => [
            localize('{{field_name}} has exceeded maximum length', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
        ];

        // const getOfferAmountMessages = field_name => [
        //     localize('{{field_name}} is required', { field_name }),
        //     localize('Enter a valid amount'),
        //     localize('Max available amount is {{value}}', { value: this.available_balance }),
        //     localize('Enter a valid amount'),
        //     localize('{{field_name}} should not be below Min limit', { field_name }),
        //     localize('{{field_name}} should not be below Max limit', { field_name }),
        // ];

        const getMaxTransactionLimitMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not be below Min limit', { field_name }),
        ];

        const getMinTransactionLimitMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not exceed Max limit', { field_name }),
        ];

        const getPriceRateMessages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
        ];

        const errors = {};

        Object.entries(validations).forEach(([key, rules]) => {
            const error_index = rules.findIndex(v => !v(values[key]));
            if (error_index !== -1) {
                switch (key) {
                    case 'contact_info':
                        errors[key] = getContactInfoMessages(mapped_key[key])[error_index];
                        break;
                    case 'description':
                        errors[key] = getDefaultAdvertDescriptionMessages(mapped_key[key])[error_index];
                        break;
                    // case 'offer_amount':
                    //     errors[key] = getOfferAmountMessages(mapped_key[key])[error_index];
                    //     break;
                    case 'max_transaction':
                        errors[key] = getMaxTransactionLimitMessages(mapped_key[key])[error_index];
                        break;
                    case 'min_transaction':
                        errors[key] = getMinTransactionLimitMessages(mapped_key[key])[error_index];
                        break;
                    case 'price_rate':
                        errors[key] = getPriceRateMessages(mapped_key[key])[error_index];
                        break;
                    default:
                        errors[key] = getCommonMessages(mapped_key[key])[error_index];
                }
            }
        });

        if (Object.values(errors).includes('Enter a valid amount')) {
            Object.entries(errors).forEach(([key, value]) => {
                errors[key] = value === 'Enter a valid amount' ? value : undefined;
            });
        }

        return errors;
    }
}
