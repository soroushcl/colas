const mockFetch = jest.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

global.fetch = mockFetch;


import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ServiceProvider } from '@/providers/ServiceProviders';
import API from '@/services/api';
import userEvent from '@testing-library/user-event';
import Page from '../page';
import { AppRouterContextProviderMock } from '@/test/AppRouterContextMock';
import { createContext, useContext } from 'react';
import { RecipeStore } from '@/stores/recipeStore';
import { createMockApiResponse } from '@/test/responses';
import { UserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

interface Stores {
    userStore: UserStore;
    recipeStore: RecipeStore;
}
const defaultAPI = new API();

const MockStoreContext = createContext<Stores | null>(null);


const MockStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const userStore = new UserStore(defaultAPI)
    const recipeStore = new RecipeStore(defaultAPI)

    const stores: Stores = { userStore, recipeStore };
    // const mockUserStore = new UserStore(defaultAPI);
    return (
        <MockStoreContext.Provider value={stores}>
            {children}
        </MockStoreContext.Provider>
    );
};
jest.mock('../../../../../stores/StoreContext', () => ({
    useStores: () => useContext(MockStoreContext),
}));
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const renderPage = () => {
    return render(
        <AppRouterContextProviderMock>
            <ServiceProvider api={defaultAPI}>
                <MockStoreProvider>
                    <Page params={{
                        forgotPasswordId: forgotPasswordId
                    }} />
                </MockStoreProvider>
            </ServiceProvider>
        </AppRouterContextProviderMock>
    );
};

const errorId = 'error-text';
const forgotPasswordId = '1234';

// const toggleButtonId = 'eye-button';
const somePassword = '123';
const wrongPassword = '12';
const successResponse = createMockApiResponse({
    json: {
        success: true,
        payload:{
            res: true
        }
    }
});
const failedResponse = createMockApiResponse({ error: 'Wrong credentials' });

describe('ResetPasswordPage', () => {
    it('matches the snapshot', () => {
        const page = renderPage();
        expect(page).toMatchSnapshot();
    });
});


describe('ResetPasswordPage - Password Input', () => {
    it('changes on user input', async () => {
        renderPage();
        const newPasswordInput = screen.getByPlaceholderText('New password');
        expect(newPasswordInput).toHaveAttribute('type', 'password');
        expect(newPasswordInput).toHaveValue('');
        await userEvent.type(newPasswordInput, somePassword);
        expect(newPasswordInput).toHaveValue(somePassword);
    });
});

describe('ResetPasswordPage - Repassword Input', () => {
    it('changes on user input', async () => {
        renderPage();
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        expect(repeatPasswordInput).toHaveAttribute('type', 'password');
        expect(repeatPasswordInput).toHaveValue('');
        await userEvent.type(repeatPasswordInput, somePassword);
        expect(repeatPasswordInput).toHaveValue(somePassword);
    });
});

describe('ResetPasswordPage', () => {
    it('has empty fields and a disabled submit button on load', async () => {
        renderPage();

        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        expect(newPasswordInput).toHaveValue('');
        expect(repeatPasswordInput).toHaveValue('');

        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        expect(submitButton).toBeDisabled();
    });

    it('does not enable submit when the form has a bad Password', async () => {
        renderPage();
        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        await userEvent.type(newPasswordInput, wrongPassword);
        await userEvent.type(repeatPasswordInput, wrongPassword);


        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        expect(submitButton).toBeDisabled();
    });

    it('does not enable submit when the form has a not equal Password and Repassword', async () => {
        renderPage();
        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        await userEvent.type(newPasswordInput, somePassword);
        await userEvent.type(repeatPasswordInput, wrongPassword);


        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        expect(submitButton).toBeDisabled();
    });

    it('submit button is enabled when inputs are correct', async () => {
        renderPage();
        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        await userEvent.type(newPasswordInput, somePassword);
        await userEvent.type(repeatPasswordInput, somePassword);


        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        expect(submitButton).toBeEnabled();
    });

    it('displays an error message on failed set password', async () => {
        const forgotSpy = jest.spyOn(defaultAPI, 'resetPasswordRequest');
        renderPage();
        forgotSpy.mockResolvedValueOnce(failedResponse.json().payload)
        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        await userEvent.type(newPasswordInput, somePassword);
        await userEvent.type(repeatPasswordInput, somePassword);


        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.click(submitButton);

        expect(forgotSpy).toHaveBeenCalledWith(somePassword, somePassword, forgotPasswordId);
        const errorMessage = await screen.findByTestId(errorId);
        expect(errorMessage).toBeInTheDocument();
    });
});
describe('ResetPasswordPage', () => {
    it('forward to "/" on successful set password', async () => {
        const forgotSpy = jest.spyOn(defaultAPI, 'resetPasswordRequest');
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        renderPage();
        forgotSpy.mockResolvedValueOnce(successResponse.json().payload)
        const newPasswordInput = screen.getByPlaceholderText('New password');
        const repeatPasswordInput = screen.getByPlaceholderText('Repeat your new password');
        await userEvent.type(newPasswordInput, somePassword);
        await userEvent.type(repeatPasswordInput, somePassword);


        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.click(submitButton);

        expect(forgotSpy).toHaveBeenCalledWith(somePassword, somePassword, forgotPasswordId);
        expect(pushMock).toHaveBeenCalledWith('/');
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

});
