import React from 'react';
import { waitFor } from '@testing-library/react';
import { routes } from '@deriv/shared';
import GeneralStore from '../general-store';
import CashierNotifications from 'Containers/cashier-notifications.jsx';

let cashier_menu, general_store, root_store, WS;

beforeEach(() => {
    root_store = {
        client: {
            account_list: [{ is_virtual: 0, title: 'USD' }],
            account_status: {
                status: [],
                cashier_validation: [],
            },
            balance: null,
            currency: 'USD',
            has_active_real_account: false,
            is_logged_in: true,
            is_eu: false,
            is_virtual: false,
            switched: false,
        },
        common: {
            routeTo: jest.fn(),
        },
        menu: {
            attach: jest.fn(),
            update: jest.fn(),
        },
        modules: {
            cashier: {
                account_prompt_dialog: {
                    last_location: null,
                    resetIsConfirmed: jest.fn(),
                    resetLastLocation: jest.fn(),
                },
                account_transfer: {
                    accounts_list: [],
                    container: 'account_transfer',
                    selected_from: { balance: null },
                    sortAccountsTransfer: jest.fn(),
                },
                crypto_fiat_converter: {
                    converter_from_amount: null,
                },
                iframe: {
                    clearIframe: jest.fn(),
                },
                onramp: {
                    is_onramp_tab_visible: false,
                },
                payment_agent: {
                    verification: {
                        clearVerification: jest.fn(),
                    },
                    getAllPaymentAgentList: jest.fn().mockResolvedValue(['PA1', 'PA2']),
                    setAllPaymentAgentList: jest.fn(),
                    setPaymentAgentList: jest.fn().mockResolvedValueOnce([]),
                },
                payment_agent_transfer: {
                    is_payment_agent: false,
                    checkIsPaymentAgent: jest.fn(),
                },
                transaction_history: {
                    is_crypto_transactions_visible: false,
                    onMount: jest.fn(),
                    setIsCryptoTransactionsVisible: jest.fn(),
                },
                withdraw: {
                    check10kLimit: jest.fn().mockResolvedValueOnce(),
                    setIsWithdrawConfirmed: jest.fn(),
                    verification: {
                        clearVerification: jest.fn(),
                    },
                },
            },
        },
        ui: {
            toggleSetCurrencyModal: jest.fn(),
        },
    };
    WS = {
        authorized: {
            p2pAdvertiserInfo: jest.fn().mockResolvedValueOnce({ error: { code: 'advertiser_error' } }),
        },
        wait: jest.fn(),
    };
    general_store = new GeneralStore({ root_store, WS });

    cashier_menu = {
        id: 'dt_cashier_tab',
        icon: <CashierNotifications p2p_notification_count={general_store.p2p_notification_count} />,
        text: expect.any(Function),
        link_to: routes.cashier,
        onClick: false,
        login_only: true,
    };
});

describe('GeneralStore', () => {
    it('should call setHasSetCurrency and attachCashierToMenu methods from "when" reaction if is_logged_in is equal to true', () => {
        const spySetHasSetCurrency = jest.spyOn(general_store, 'setHasSetCurrency');
        const spyAttachCashierToMenu = jest.spyOn(general_store, 'attachCashierToMenu');

        expect(spyAttachCashierToMenu).toHaveBeenCalledAfter(spySetHasSetCurrency);
    });

    it('should set function on remount', () => {
        general_store.setOnRemount('function');

        expect(general_store.onRemount).toBe('function');
    });

    it('should return false if the client currency is equal to USD when is_crypto property was called', () => {
        expect(general_store.is_crypto).toBeFalse();
    });

    it('should return true if the client currency is equal to BTC when is_crypto property was called', () => {
        general_store.root_store.client.currency = 'BTC';
        expect(general_store.is_crypto).toBeTrue();
    });

    it('should return false if is_p2p_visible equal to false when is_p2p_enabled property was called', () => {
        expect(general_store.is_p2p_enabled).toBeFalse();
    });

    it('should return false if is_p2p_visible equal to true and the client is from eu country when is_p2p_enabled property was called', () => {
        general_store.setIsP2pVisible(true);
        general_store.root_store.client.is_eu = true;
        expect(general_store.is_p2p_enabled).toBeFalse();
    });

    it('should return true if is_p2p_visible equal to true and the client is not from eu country when is_p2p_enabled property was called', () => {
        general_store.setIsP2pVisible(true);
        expect(general_store.is_p2p_enabled).toBeTrue();
    });

    it('should not show p2p in cashier default if p2p_advertiser_error is equal to "RestrictedCountry"', () => {
        general_store.setP2pAdvertiserError('RestrictedCountry');
        general_store.showP2pInCashierDefault();

        expect(general_store.show_p2p_in_cashier_default).toBeFalse();
    });

    it('should not show p2p in cashier default if the user has accounts with fiat currency, but has not account with USD currency', () => {
        general_store.root_store.client.account_list = [{ title: 'EUR' }];
        general_store.showP2pInCashierDefault();

        expect(general_store.show_p2p_in_cashier_default).toBeFalse();
    });

    it('should not show p2p in cashier default if the user has accounts with fiat currency, but has not account with USD currency', () => {
        general_store.root_store.client.account_list = [{ title: 'EUR' }];
        general_store.showP2pInCashierDefault();

        expect(general_store.show_p2p_in_cashier_default).toBeFalse();
    });

    it('should show p2p in cashier default if the user account is not virtual, there is no p2p_advertiser_error and he has USD account', () => {
        general_store.showP2pInCashierDefault();

        expect(general_store.show_p2p_in_cashier_default).toBeTrue();
    });

    it('should show p2p in cashier default if the user account is not virtual, there is no p2p_advertiser_error and he has not fiat currency accounts', () => {
        general_store.root_store.client.account_list = [{ title: 'BTC' }];
        general_store.showP2pInCashierDefault();

        expect(general_store.show_p2p_in_cashier_default).toBeTrue();
    });

    it('should call setHasSetCurrency method if has_set_currency is equal to false and attach cashier menu with proper properties', () => {
        general_store.has_set_currency = false;
        const spySetHasSetCurrency = jest.spyOn(general_store, 'setHasSetCurrency');
        general_store.attachCashierToMenu();

        expect(spySetHasSetCurrency).toHaveBeenCalledTimes(1);
        expect(general_store.root_store.menu.attach).toHaveBeenCalledWith(cashier_menu);
    });

    it('should attach cashier menu and set onClick property to ui.toggleSetCurrencyModal and link_to = false if the client did not set the currency', () => {
        general_store.has_set_currency = false;
        general_store.root_store.client.account_list = [{ is_virtual: 0, title: 'Real' }];
        general_store.root_store.client.has_active_real_account = true;
        general_store.attachCashierToMenu();

        expect(general_store.root_store.menu.attach).toHaveBeenCalledWith({
            ...cashier_menu,
            link_to: false,
            onClick: general_store.root_store.ui.toggleSetCurrencyModal,
        });
    });

    it('should replace cashier menu onClick to false if the client set the currency', () => {
        general_store.replaceCashierMenuOnclick();

        expect(general_store.root_store.menu.update).toHaveBeenCalledWith(cashier_menu, 1);
    });

    it('should replace cashier menu onClick to ui.toggleSetCurrencyModal if the client did not set the currency', () => {
        general_store.root_store.client.account_list = [{ is_virtual: 0, title: 'Real' }];
        general_store.root_store.client.has_active_real_account = true;
        general_store.replaceCashierMenuOnclick();

        expect(general_store.root_store.menu.update).toHaveBeenCalledWith(
            {
                ...cashier_menu,
                link_to: false,
                onClick: general_store.root_store.ui.toggleSetCurrencyModal,
            },
            1
        );
    });

    it('should set has_set_currency equal to true if the client has real USD account', () => {
        general_store.setHasSetCurrency();

        expect(general_store.has_set_currency).toBeTrue();
    });

    it('should set has_set_currency equal to false if the client has real account with account.title = "Real"', () => {
        general_store.root_store.client.account_list = [{ is_virtual: 1, title: 'Real' }];
        general_store.root_store.client.has_active_real_account = true;
        general_store.setHasSetCurrency();

        expect(general_store.has_set_currency).toBeFalse();
    });

    it('should change the value of the variable should_set_currency_modal_title_change equal to true', () => {
        general_store.changeSetCurrencyModalTitle();

        expect(general_store.should_set_currency_modal_title_change).toBeTrue();
    });

    it('should perform proper cashier default mounting', async () => {
        general_store.has_set_currency = false;
        const spySetHasSetCurrency = jest.spyOn(general_store, 'setHasSetCurrency');
        const spySetIsCashierDefault = jest.spyOn(general_store, 'setIsCashierDefault');
        const spySetLoading = jest.spyOn(general_store, 'setLoading');
        const { account_prompt_dialog, payment_agent } = general_store.root_store.modules.cashier;
        await general_store.onMountCashierDefault();

        expect(spySetHasSetCurrency).toHaveBeenCalledTimes(1);
        expect(spySetIsCashierDefault).toHaveBeenCalledWith(true);
        expect(account_prompt_dialog.resetIsConfirmed).toHaveBeenCalledTimes(1);
        expect(spySetLoading.mock.calls).toEqual([[true], [false]]);
        expect(payment_agent.setAllPaymentAgentList).toHaveBeenCalledWith(['PA1', 'PA2']);
    });

    it('should calculate proper percentage for account transfer container', () => {
        general_store.root_store.modules.cashier.crypto_fiat_converter.converter_from_amount = 500;
        general_store.root_store.modules.cashier.account_transfer.selected_from.balance = 10000;
        general_store.setActiveTab('account_transfer');
        general_store.calculatePercentage();

        expect(general_store.percentage).toBe(5);
    });

    it('should calculate proper percentage for other containers', () => {
        general_store.root_store.client.balance = 9000;
        general_store.setActiveTab('deposit');
        general_store.calculatePercentage(1000);

        expect(general_store.percentage).toBe(11);
    });

    it('should set percentage equal to zero if calculated percentage is not finite number', () => {
        general_store.root_store.client.balance = 9000;
        general_store.setActiveTab('deposit');
        general_store.calculatePercentage('abc');

        expect(general_store.percentage).toBe(0);
    });

    it('should reset percentage', () => {
        general_store.percentage = 50;
        general_store.percentageSelectorSelectionStatus(true);

        expect(general_store.percentage).toBe(0);
    });

    it('should cahange value of the variable is_deposit', () => {
        general_store.setIsDeposit(true);

        expect(general_store.is_deposit).toBeTrue();
    });

    it('should cahange value of the variable should_show_all_available_currencies', () => {
        general_store.setShouldShowAllAvailableCurrencies(true);

        expect(general_store.should_show_all_available_currencies).toBeTrue();
    });

    it('should cahange value of the variable is_cashier_default', () => {
        general_store.setIsCashierDefault(true);

        expect(general_store.is_cashier_default).toBeTrue();
    });

    it('should set deposit target', () => {
        general_store.setDepositTarget('/cashier/payment-agent');

        expect(general_store.deposit_target).toBe('/cashier/payment-agent');
    });

    it('should route to deposit target', () => {
        general_store.setDepositTarget('/cashier/payment-agent');
        general_store.continueRoute();

        expect(general_store.root_store.common.routeTo).toHaveBeenCalledWith('/cashier/payment-agent');
    });

    it('should perform proper setAccountSwitchListener invocation', () => {
        const spyDisposeSwitchAccount = jest.spyOn(general_store, 'disposeSwitchAccount');
        const spyOnSwitchAccount = jest.spyOn(general_store, 'onSwitchAccount');
        general_store.setAccountSwitchListener();

        expect(spyDisposeSwitchAccount).toHaveBeenCalledTimes(1);
        expect(spyOnSwitchAccount).toHaveBeenCalledAfter(spyDisposeSwitchAccount);
        expect(spyOnSwitchAccount).toHaveBeenCalledWith(general_store.accountSwitcherListener);
    });

    it('should perform proper init invocation when is_logged_in is equal to true', async () => {
        const spyGetAdvertizerError = jest.spyOn(general_store, 'getAdvertizerError');
        const spyCheckP2pStatus = jest.spyOn(general_store, 'checkP2pStatus');
        general_store.root_store.client.is_logged_in = true;
        general_store.init();

        await waitFor(() => {
            expect(spyGetAdvertizerError).toHaveBeenCalledTimes(1);
        });
        expect(spyCheckP2pStatus).toHaveBeenCalledTimes(1);
        expect(general_store.WS.wait).toHaveBeenCalledTimes(1);
        expect(general_store.root_store.modules.cashier.account_prompt_dialog.resetLastLocation).toHaveBeenCalledTimes(1);
        expect(general_store.root_store.modules.cashier.withdraw.check10kLimit).toHaveBeenCalledTimes(1);
    });

    it('should set advertiser error', async () => {
        const spySetP2pAdvertiserError = jest.spyOn(general_store, 'setP2pAdvertiserError');
        await general_store.getAdvertizerError();

        expect(spySetP2pAdvertiserError).toHaveBeenCalledWith('advertiser_error');
    });

    it('should set p2p advertiser error', () => {
        general_store.setP2pAdvertiserError('p2p_advertiser_error');

        expect(general_store.p2p_advertiser_error).toBe('p2p_advertiser_error');
    });

    it('should set is_p2p_visible equal to false, if there is a "RestrictedCountry" p2p advertiser error', () => {
        general_store.setP2pAdvertiserError('RestrictedCountry');
        general_store.checkP2pStatus();

        expect(general_store.is_p2p_visible).toBeFalse();
    });

    it('should set is_p2p_visible equal to false, if there is a "RestrictedCurrency" p2p advertiser error', () => {
        general_store.setP2pAdvertiserError('RestrictedCurrency');
        general_store.checkP2pStatus();

        expect(general_store.is_p2p_visible).toBeFalse();
    });

    it('should set is_p2p_visible equal to false, if there is a virtual account', () => {
        general_store.root_store.client.is_virtual = true;
        general_store.checkP2pStatus();

        expect(general_store.is_p2p_visible).toBeFalse();
    });

    it('should check is the client a payment agent ? when onMountCommon was called', async () => {
        general_store.root_store.client.is_logged_in = true;
        await general_store.onMountCommon(false);

        expect(
            general_store.root_store.modules.cashier.payment_agent_transfer.checkIsPaymentAgent
        ).toHaveBeenCalledTimes(1);
    });

    it('should not call setPaymentAgentList method if is_populating_values is equal to true when onMountCommon was called', async () => {
        general_store.is_populating_values = true;
        await general_store.onMountCommon(false);

        await waitFor(() => {
            expect(general_store.root_store.modules.cashier.payment_agent.setPaymentAgentList).not.toHaveBeenCalled();
        });
    });

    it('should sort accounts transfer when onMountCommon was called', async () => {
        general_store.root_store.client.is_logged_in = true;
        await general_store.onMountCommon(false);

        expect(general_store.root_store.modules.cashier.account_transfer.sortAccountsTransfer).toHaveBeenCalledTimes(1);
    });

    it('should setOnRemount when onMountCommon was called with true argument', async () => {
        general_store.root_store.client.is_logged_in = true;
        const spySetOnRemount = jest.spyOn(general_store, 'setOnRemount');
        await general_store.onMountCommon(true);

        expect(spySetOnRemount).toHaveBeenCalledWith(general_store.onMountCommon);
    });

    it('should route to deposit page of onramp tab is not visible and location.pahname = /cashier/on-ramp when onMountCommon was called', async () => {
        jest.spyOn(window, 'window', 'get').mockImplementation(() => ({
            location: {
                pathname: routes.cashier_onramp,
            },
        }));
        general_store.root_store.client.is_logged_in = true;
        await general_store.onMountCommon(false);

        expect(general_store.root_store.common.routeTo).toHaveBeenCalledWith(routes.cashier_deposit);
        jest.restoreAllMocks();
    });

    it('should route to deposit page and call proper methods if is_crypto_transactions_visible equal to false and location.pahname = /cashier/crypto-transactions when onMountCommon was called', async () => {
        jest.spyOn(window, 'window', 'get').mockImplementation(() => ({
            location: {
                pathname: routes.cashier_crypto_transactions,
            },
        }));
        const { onMount, setIsCryptoTransactionsVisible } =
            general_store.root_store.modules.cashier.transaction_history;
        general_store.root_store.client.is_logged_in = true;
        await general_store.onMountCommon(false);

        expect(general_store.root_store.common.routeTo).toHaveBeenCalledWith(routes.cashier_deposit);
        expect(setIsCryptoTransactionsVisible).toHaveBeenCalledWith(true);
        expect(onMount).toHaveBeenCalledTimes(1);
        jest.restoreAllMocks();
    });

    it('should set cashier tab index', () => {
        general_store.setCashierTabIndex(1);

        expect(general_store.cashier_route_tab_index).toBe(1);
    });

    it('should set notification count', () => {
        general_store.setNotificationCount(1);

        expect(general_store.p2p_notification_count).toBe(1);
    });

    it('should set p2p visibility equal to true', () => {
        general_store.setIsP2pVisible(true);

        expect(general_store.is_p2p_visible).toBeTrue();
    });

    it('should set p2p visibility equal to false and route to /cashier/deposit if current location.pathname = /cashier/p2p and account_prompt_dialog.last_location is equal to null', () => {
        jest.spyOn(window, 'window', 'get').mockImplementation(() => ({
            location: {
                pathname: routes.cashier_p2p,
            },
        }));
        general_store.setIsP2pVisible(false);

        expect(general_store.is_p2p_visible).toBeFalse();
        expect(general_store.root_store.common.routeTo).toHaveBeenCalledWith(routes.cashier_deposit);
    });

    it('should return is_cashier_locked equal to false if account_status is undefined', () => {
        general_store.root_store.client.account_status = undefined;
        expect(general_store.is_cashier_locked).toBeFalse();
    });

    it('should return is_cashier_locked equal to false if there is no cashier_locked status', () => {
        expect(general_store.is_cashier_locked).toBeFalse();
    });

    it('should return is_cashier_locked equal to true if there is cashier_locked status', () => {
        general_store.root_store.client.account_status.status.push('cashier_locked');
        expect(general_store.is_cashier_locked).toBeTrue();
    });

    it('should return is_system_maintenance equal to false if account_status is undefined', () => {
        general_store.root_store.client.account_status = undefined;
        expect(general_store.is_system_maintenance).toBeFalse();
    });

    it('should return is_system_maintenance equal to false if there is no system_maintenance status', () => {
        expect(general_store.is_system_maintenance).toBeFalse();
    });

    it('should return is_system_maintenance equal to true if there is system_maintenance status', () => {
        general_store.root_store.client.account_status.cashier_validation.push('system_maintenance');
        expect(general_store.is_system_maintenance).toBeTrue();
    });

    it('should change the value of the variable is_loading', () => {
        general_store.setLoading(true);
        expect(general_store.is_loading).toBeTrue();
    });

    it('should set active tab', () => {
        general_store.setActiveTab('deposit');
        expect(general_store.active_container).toBe('deposit');
    });

    it('should perform proper accountSwitcherListener invocation', () => {
        const spyOnRemount = jest.spyOn(general_store, 'onRemount');
        general_store.accountSwitcherListener();

        const { iframe, payment_agent, withdraw } = general_store.root_store.modules.cashier;

        expect(withdraw.verification.clearVerification).toHaveBeenCalledTimes(1);
        expect(payment_agent.verification.clearVerification).toHaveBeenCalledTimes(1);
        expect(iframe.clearIframe).toHaveBeenCalledTimes(1);
        expect(general_store.payment_agent).toEqual(payment_agent);
        expect(general_store.is_populating_values).toBeFalse();
        expect(spyOnRemount).toHaveBeenCalledTimes(1);
    });
});
