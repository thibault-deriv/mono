import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CryptoDeposit from '../crypto-deposit';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router';
import { getCurrencyName, isMobile } from '@deriv/shared';

jest.mock('Stores/connect.js', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Loading: () => <div>Loading</div>,
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getCurrencyName: jest.fn(),
    isMobile: jest.fn(() => false),
}));

jest.mock('qrcode.react', () => () => <div>QRCode</div>);

jest.mock('Components/recent-transaction', () => () => <div>RecentTransactions</div>);

describe('<CryptoDeposit />', () => {
    let history;
    const renderWithRouter = component => {
        history = createBrowserHistory();
        return render(<Router history={history}>{component}</Router>);
    };

    const props = {
        api_error: '',
        crypto_transactions: [{}],
        currency: 'BTC',
        deposit_address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        is_deposit_address_loading: false,
        pollApiForDepositAddress: jest.fn(),
        recentTransactionOnMount: jest.fn(),
        setIsDeposit: jest.fn(),
    };

    it('should show loader', () => {
        renderWithRouter(<CryptoDeposit {...props} is_deposit_address_loading />);

        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should show proper error message and button', () => {
        renderWithRouter(<CryptoDeposit {...props} api_error='api_error' />);

        expect(
            screen.getByText(
                "Unfortunately, we couldn't get the address since our server was down. Please click Refresh to reload the address or try again later."
            )
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });

    it('should trigger onClick callback when the user clicks "Refresh" button', () => {
        renderWithRouter(<CryptoDeposit {...props} api_error='api_error' />);

        const refresh_btn = screen.getByRole('button', { name: 'Refresh' });
        fireEvent.click(refresh_btn);

        expect(props.pollApiForDepositAddress).toHaveBeenCalledTimes(2);
    });

    it('should show proper messsages for BTC cryptocurrency', () => {
        getCurrencyName.mockReturnValueOnce('Bitcoin');
        renderWithRouter(<CryptoDeposit {...props} />);

        expect(screen.getByText('Send only Bitcoin (BTC) to this address.')).toBeInTheDocument();
        expect(
            screen.getByText("Do not send any other currency to the following address. Otherwise, you'll lose funds.")
        ).toBeInTheDocument();
        expect(screen.getByText('tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt')).toBeInTheDocument();
        expect(screen.getByText('QRCode')).toBeInTheDocument();
        expect(screen.getByText('Looking for a way to buy cryptocurrency?')).toBeInTheDocument();
        expect(
            screen.getByText('Use our fiat onramp services to buy and deposit cryptocurrency into your Deriv account.')
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Try our Fiat onramp' })).toBeInTheDocument();
    });

    it('should show proper messsages for ETH cryptocurrency', () => {
        getCurrencyName.mockReturnValueOnce('Ethereum');
        renderWithRouter(<CryptoDeposit {...props} currency='ETH' />);

        expect(screen.getByText('Send only Ethereum (ETH) to this address.')).toBeInTheDocument();
        expect(
            screen.getByText('Please select the network from where your deposit will come from.')
        ).toBeInTheDocument();
        expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('should show proper messages for selected options for ETH, USDC, eUSDT cryptocurrency', () => {
        const checkMessagesForOptions = (currency, token) => {
            const { rerender, unmount } = renderWithRouter(<CryptoDeposit {...props} currency={currency} />);
            const rerenderAndOpenDropdownOptions = () => {
                rerender(
                    <Router history={history}>
                        <CryptoDeposit {...props} currency={currency} />
                    </Router>
                );
                const dropdown_display = screen.getByTestId('dti_dropdown_display');
                fireEvent.click(dropdown_display);
                return screen.getAllByTestId('dti_list_item');
            };

            rerenderAndOpenDropdownOptions().forEach(option => {
                if (option.textContent === 'Binance Smart Chain') {
                    fireEvent.click(option);
                    expect(
                        screen.getByText(
                            `We do not support Binance Smart Chain tokens to deposit, please use only Ethereum (${token}).`
                        )
                    ).toBeInTheDocument();
                    unmount();
                }
            });

            rerenderAndOpenDropdownOptions().forEach(option => {
                if (option.textContent === 'Polygon (Matic)') {
                    fireEvent.click(option);
                    expect(
                        screen.getByText(
                            `We do not support Polygon (Matic), to deposit please use only Ethereum (${token}).`
                        )
                    ).toBeInTheDocument();
                    unmount();
                }
            });

            rerenderAndOpenDropdownOptions().forEach(option => {
                if (option.textContent === 'Tron') {
                    fireEvent.click(option);
                    expect(
                        screen.getByText(`We do not support Tron, to deposit please use only Ethereum (${token}).`)
                    ).toBeInTheDocument();
                    unmount();
                }
            });

            rerenderAndOpenDropdownOptions().forEach(option => {
                if (option.textContent === 'Ethereum (ERC20)') {
                    fireEvent.click(option);
                    if (currency === 'ETH') {
                        expect(
                            screen.getByText(
                                `This is an Ethereum (${token}) only address, please do not use ${
                                    token === 'ERC20' ? 'ETH' : 'ERC20 token'
                                }.`
                            )
                        ).toBeInTheDocument();
                        unmount();
                    } else if (['USDC', 'eUSDT'].includes(currency)) {
                        expect(
                            screen.getByText(
                                "Do not send any other currency to the following address. Otherwise, you'll lose funds."
                            )
                        ).toBeInTheDocument();
                        expect(screen.getByText('QRCode')).toBeInTheDocument();
                        expect(screen.getByText('tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt')).toBeInTheDocument();
                        unmount();
                    }
                }
            });

            rerenderAndOpenDropdownOptions().forEach(option => {
                if (option.textContent === 'Ethereum (ETH)') {
                    fireEvent.click(option);
                    if (currency === 'ETH') {
                        expect(
                            screen.getByText(
                                "Do not send any other currency to the following address. Otherwise, you'll lose funds."
                            )
                        ).toBeInTheDocument();
                        expect(screen.getByText('QRCode')).toBeInTheDocument();
                        expect(screen.getByText('tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt')).toBeInTheDocument();
                        unmount();
                    } else if (['USDC', 'eUSDT'].includes(currency)) {
                        expect(
                            screen.getByText(
                                `This is an Ethereum (${token}) only address, please do not use ${
                                    token === 'ERC20' ? 'ETH' : 'ERC20 token'
                                }.`
                            )
                        ).toBeInTheDocument();
                        unmount();
                    }
                }
            });
        };

        checkMessagesForOptions('ETH', 'ETH');
        checkMessagesForOptions('USDC', 'ERC20');
        checkMessagesForOptions('eUSDT', 'ERC20');
    });

    it('should show "RecentTransactions" in Mobile mode', () => {
        isMobile.mockReturnValue(true);
        renderWithRouter(<CryptoDeposit {...props} />);

        expect(screen.getByText('RecentTransactions')).toBeInTheDocument();
    });
});
