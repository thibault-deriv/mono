import { routes } from '@deriv/shared';
import AccountPromptDialogStore from '../account-prompt-dialog-store';

describe('AccountPromptDialogStore', () => {
    let account_prompt_dialog_store;
    const root_store = {
        common: {
            routeTo: jest.fn(),
        },
        client: {
            currency: 'BTC',
            switchAccount: jest.fn(),
        },
        modules: {
            cashier: {
                account_transfer: {
                    accounts_list: [
                        { currency: 'USD', is_crypto: false, text: 'USD', value: 'CR90000001' },
                        { currency: 'BTC', is_crypto: true, text: 'BTC', value: 'CR90000002' },
                    ],
                },
                general_store: {
                    setIsDeposit: jest.fn(),
                },
            },
        },
    };

    beforeEach(() => {
        account_prompt_dialog_store = new AccountPromptDialogStore(root_store);
    });

    it('should show the dialog', () => {
        account_prompt_dialog_store.shouldNavigateAfterPrompt(routes.cashier_deposit, 'deposit');

        expect(account_prompt_dialog_store.last_location).toBe(routes.cashier_deposit);
        expect(account_prompt_dialog_store.should_show).toBeTrue();
        expect(account_prompt_dialog_store.current_location).toBe('deposit');
    });

    it('should reset last_location', () => {
        account_prompt_dialog_store.resetLastLocation();

        expect(account_prompt_dialog_store.last_location).toBeNull();
    });

    it('should reset is_confirmed', () => {
        account_prompt_dialog_store.resetIsConfirmed();

        expect(account_prompt_dialog_store.is_confirmed).toBeFalse();
    });

    it('should hide the dialog then switch to fiat account if the client is on crypto account upon confirm', async () => {
        account_prompt_dialog_store.shouldNavigateAfterPrompt(routes.cashier_deposit, 'deposit');
        await account_prompt_dialog_store.onConfirm();

        expect(account_prompt_dialog_store.should_show).toBeFalse();
        expect(account_prompt_dialog_store.is_confirmed).toBeTrue();
        expect(account_prompt_dialog_store.root_store.client.switchAccount).toHaveBeenCalledWith('CR90000001');
        expect(account_prompt_dialog_store.root_store.modules.cashier.general_store.setIsDeposit).toHaveBeenCalledWith(
            true
        );

        account_prompt_dialog_store.continueRoute();
        expect(account_prompt_dialog_store.root_store.common.routeTo).toHaveBeenCalledWith(routes.cashier_deposit);
    });

    it('should hide the dialog then stay on page if the client is on fiat account upon confirm', async () => {
        account_prompt_dialog_store.root_store.client.currency = 'USD';

        account_prompt_dialog_store.shouldNavigateAfterPrompt(routes.cashier_deposit, 'deposit');
        await account_prompt_dialog_store.onConfirm();

        expect(account_prompt_dialog_store.should_show).toBeFalse();
        expect(account_prompt_dialog_store.is_confirmed).toBeTrue();
        expect(account_prompt_dialog_store.root_store.client.switchAccount).not.toHaveBeenCalled();
    });

    it('should hide the dialog on cancel', () => {
        account_prompt_dialog_store.onCancel();

        expect(account_prompt_dialog_store.should_show).toBeFalse();
    });
});
