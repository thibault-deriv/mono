import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CashierDefaultSideNote from '../cashier-default-side-note';

jest.mock('Stores/connect.js', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

describe('<CashierDefaultSideNote />', () => {
    it('should show the proper messages, with fiat currency and can_change_fiat_currency={false} property', () => {
        render(<CashierDefaultSideNote currency={'USD'} can_change_fiat_currency={false} is_crypto={false} />);

        expect(screen.getByText('Your fiat account currency is set to USD.')).toBeInTheDocument();
        expect(screen.getByTestId('side-note-text')).toHaveTextContent(
            'If you want to change your account currency, please contact us via live chat.'
        );
    });

    it('should trigger onClick callback when the client clicks the "live chat" link', () => {
        window.LC_API = {
            open_chat_window: jest.fn(),
        };
        render(<CashierDefaultSideNote currency={'USD'} can_change_fiat_currency={false} is_crypto={false} />);

        const live_chat_link = screen.getByText('live chat');
        fireEvent.click(live_chat_link);
        expect(window.LC_API.open_chat_window).toHaveBeenCalledTimes(1);
    });

    it('should show the proper messages when is_crypto is true', () => {
        render(<CashierDefaultSideNote currency={'BTC'} is_crypto />);

        expect(screen.getByText('This is your BTC account.')).toBeInTheDocument();
        expect(
            screen.getByText("Don't want to trade in BTC? You can open another cryptocurrency account.")
        ).toBeInTheDocument();
        expect(screen.getByText('Manage your accounts')).toBeInTheDocument();
    });

    it('should trigger onClick callbacks when the client clicks on "Manage your accounts" link', () => {
        const openRealAccountSignup = jest.fn();
        const setDepositTarget = jest.fn();
        const { container } = render(
            <CashierDefaultSideNote
                currency={'BTC'}
                is_crypto
                openRealAccountSignup={openRealAccountSignup}
                setDepositTarget={setDepositTarget}
            />
        );

        const link = container.querySelector('.cashier-default-side-note__link');
        fireEvent.click(link);
        expect(openRealAccountSignup).toHaveBeenCalledTimes(1);
        expect(setDepositTarget).toHaveBeenCalledTimes(1);
    });
});
