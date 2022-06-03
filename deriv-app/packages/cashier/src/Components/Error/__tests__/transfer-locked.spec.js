import React from 'react';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { fireEvent, render, screen } from '@testing-library/react';
import { Checklist } from '@deriv/components';
import { routes } from '@deriv/shared';
import TransferLocked from '../transfer-locked';

jest.mock('Stores/connect', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

describe('TransferLocked', () => {
    it('Should show the default lock content if the account is not financial', () => {
        render(
            <TransferLocked
                is_financial_account={false}
                is_financial_information_incomplete
                is_trading_experience_incomplete
            />
        );
        expect(screen.getByText('Transfers are locked')).toBeInTheDocument();
    });

    it('Should show the default lock content if the account is financial and any of the account information (financial or trading_experience) is incomplete', () => {
        render(
            <TransferLocked
                is_financial_account
                is_financial_information_incomplete={false}
                is_trading_experience_incomplete
            />
        );
        expect(screen.getByText('Transfers are locked')).toBeInTheDocument();
    });

    it('Should trigger click on the checklist item', () => {
        const onClick = jest.fn();
        const items = [
            {
                content: 'Complete the financial assessment form',
                status: 'action',
                onClick: onClick,
            },
        ];
        const wrapper = render(<Checklist className='cashier-locked__checklist' items={items} />);
        const btn = wrapper.container.querySelector('.dc-checklist__item-status--action');

        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalled();
    });

    it('Should show the financial assessment form and redirect to account/financial-assessment when "-->" button clicked', () => {
        const history = createBrowserHistory();
        const wrapper = render(
            <Router history={history}>
                <TransferLocked
                    is_financial_account
                    is_financial_information_incomplete
                    is_trading_experience_incomplete
                />
            </Router>
        );
        const btn = wrapper.container.querySelector('.dc-checklist__item-status--action');
        fireEvent.click(btn);

        expect(history.location.pathname).toBe(routes.financial_assessment);
        expect(screen.getByText('Complete the financial assessment form')).toBeInTheDocument();
    });
});
