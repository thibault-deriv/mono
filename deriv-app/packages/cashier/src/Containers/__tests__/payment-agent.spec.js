import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import PaymentAgent from '../payment-agent';

jest.mock('Stores/connect', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

jest.mock('@deriv/components', () => {
    const original_module = jest.requireActual('@deriv/components');

    return {
        ...original_module,
        Loading: jest.fn(() => 'mockedLoading'),
    };
});

jest.mock('Components/payment-agent-list', () => jest.fn(() => 'mockedPaymentAgentList'));
jest.mock('Components/Error/cashier-locked', () => jest.fn(() => 'mockedCashierLocked'));

describe('<PaymentAgent />', () => {
    const props = {
        container: 'payment_agent',
        is_payment_agent_withdraw: false,
        payment_agent_active_tab_index: 0,
        setActiveTab: jest.fn(),
        setPaymentAgentActiveTabIndex: jest.fn(),
        verification_code: '',
    };

    it('should render the payment agent list', () => {
        render(<PaymentAgent {...props} />);

        expect(props.setPaymentAgentActiveTabIndex).toHaveBeenCalledWith(0);
        expect(screen.getByText('mockedPaymentAgentList')).toBeInTheDocument();
    });

    it('should render the loading component if in loading state', () => {
        render(<PaymentAgent is_switching {...props} />);

        expect(screen.getByText('mockedLoading')).toBeInTheDocument();
    });

    it('should show the virtual component if the client is using demo account', () => {
        const history = createBrowserHistory();

        render(
            <Router history={history}>
                <PaymentAgent is_virtual {...props} />
            </Router>
        );

        expect(
            screen.getByText(/You need to switch to a real money account to use this feature./i)
        ).toBeInTheDocument();
    });

    it('should show the cashier locked component if cashier is locked', () => {
        render(<PaymentAgent is_cashier_locked {...props} />);

        expect(screen.getByText('mockedCashierLocked')).toBeInTheDocument();
    });

    it('should reset the index on unmount of component', () => {
        const { unmount } = render(<PaymentAgent {...props} />);

        unmount();
        expect(props.setPaymentAgentActiveTabIndex).toHaveBeenCalledWith(0);
    });

    it('should set the active tab index accordingly', () => {
        render(<PaymentAgent {...props} verification_code='7GbuuVaX' />);

        expect(props.setPaymentAgentActiveTabIndex).toHaveBeenCalledWith(1);
    });
});
