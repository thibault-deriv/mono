import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SendEmail from '../send-email';

jest.mock('Stores/connect.js', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    connect: () => Component => Component,
}));

describe('<SendEmail />', () => {
    const recentTransactionOnMount = jest.fn();
    const sendVerificationEmail = jest.fn();

    it('component should be rendered', () => {
        const { container } = render(<SendEmail is_email_sent recentTransactionOnMount={recentTransactionOnMount} />);

        expect(container.querySelector('.cashier__wrapper')).toBeInTheDocument();
    });

    it("<SendEmail /> component should be rendered when 'is_email_sent' prop is true", () => {
        const { container } = render(<SendEmail is_email_sent recentTransactionOnMount={recentTransactionOnMount} />);

        expect(container.querySelector('.email-sent')).toBeInTheDocument();
    });

    it("React.Fragment should be rendered when 'is_email_sent' prop is false", () => {
        render(<SendEmail is_email_sent={false} recentTransactionOnMount={recentTransactionOnMount} />);

        expect(screen.getByText('Please help us verify your withdrawal request.')).toBeInTheDocument();
        expect(
            screen.getByText(
                "Hit the button below and we'll send you an email with a link. Click that link to verify your withdrawal request."
            )
        ).toBeInTheDocument();
        expect(screen.getByText('This is to protect your account from unauthorised withdrawals.')).toBeInTheDocument();
    });

    it("'Send email' button should be rendered when 'is_email_sent' prop is false", () => {
        render(<SendEmail is_email_sent={false} recentTransactionOnMount={recentTransactionOnMount} />);

        expect(screen.getByRole('button', { name: 'Send email' })).toBeInTheDocument();
    });

    it("sendVerificationEmail func should be triggered when click on 'Send email' button", () => {
        render(
            <SendEmail
                is_email_sent={false}
                recentTransactionOnMount={recentTransactionOnMount}
                sendVerificationEmail={sendVerificationEmail}
            />
        );

        const btn = screen.getByRole('button', { name: 'Send email' });
        fireEvent.click(btn);

        expect(sendVerificationEmail).toHaveBeenCalled();
    });
});
