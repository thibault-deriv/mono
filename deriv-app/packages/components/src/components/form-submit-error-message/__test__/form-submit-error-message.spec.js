import React from 'react';
import { render, screen } from '@testing-library/react';
import FormSubmitErrorMessage from '../form-submit-error-message.jsx';

describe('<FormSubmitErrorMessage/>', () => {
    it('should render the message passed along with the icon', () => {
        render(<FormSubmitErrorMessage message='Form submit error' />);

        expect(screen.getByTestId('form-submit-error')).toBeInTheDocument();
        expect(screen.getByText('Form submit error')).toBeInTheDocument();
    });
});
