const mockFetch = jest.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

global.fetch = mockFetch;


import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ServiceProvider } from '@/providers/ServiceProviders';
import API from '@/services/api';
import userEvent from '@testing-library/user-event';
import Page from '../page';
import { AppRouterContextProviderMock } from '@/test/AppRouterContextMock';
import { createContext, useContext } from 'react';
import { RecipeStore } from '@/stores/recipeStore';
import { createMockApiResponse } from '@/test/responses';
import { UserStore } from '@/stores/userStore';

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
jest.mock('../../../../stores/StoreContext', () => ({
    useStores: () => useContext(MockStoreContext),
}));

const renderPage = () => {
    return render(
        <AppRouterContextProviderMock>
                <ServiceProvider api={defaultAPI}>
                    <MockStoreProvider>
                        <Page />
                    </MockStoreProvider>
                </ServiceProvider>
        </AppRouterContextProviderMock>
    );
};

const errorId = 'error-text';
const successMessage = 'successful-message';
const successEmail = 'successful-email';

// const toggleButtonId = 'eye-button';
const someEmail = 'wrong@colaskitchen.com';
const rightEmail = 'soroush@colaskitchen.com';
const badEmail = 'bad.com';
const successResponse = createMockApiResponse({
    json: {
        success: true
    }
});
const failedResponse = createMockApiResponse({error: 'Wrong credentials'});

describe('ForgotPage', () => {
    it('matches the snapshot', () => {
        const page = renderPage();
        expect(page).toMatchSnapshot();
    });
});


describe('ForgotPage - Email Input', () => {
    it('changes on user input', () => {
        renderPage();
        const allTextBoxes: HTMLInputElement[] = screen.getAllByRole('textbox');
        const emailInput: HTMLInputElement = allTextBoxes[0];

        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput.value).toBe('');

        fireEvent.change(emailInput, { target: { value: someEmail } });

        expect(emailInput.value).toBe(someEmail);
    });
});

describe('ForgotPage', () => {
    it('has empty fields and a disabled submit button on load', async () => {
        renderPage();

        const allTextBoxes: HTMLInputElement[] = screen.getAllByRole('textbox');
        const emailInput: HTMLInputElement = allTextBoxes[0];
        expect(emailInput.value).toBe('');

        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        expect(submitButton).toBeDisabled();
    });

    it('does not enable submit when the form has a bad email', async () => {
        renderPage();
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, badEmail);
        expect(submitButton).toBeDisabled();
    });

    it('submit button is enabled when inputs are correct', async () => {
        renderPage();
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        expect(submitButton).toBeDisabled();

        await userEvent.type(emailInput, someEmail);

        expect(submitButton).toBeEnabled();
    });

    it('displays an error message on failed forgot password email (wrong email)', async () => {
        const forgotSpy = jest.spyOn(defaultAPI, 'sendPasswordResetEmail');
        renderPage();
        forgotSpy.mockResolvedValueOnce(failedResponse.json().payload)
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, someEmail);

        await userEvent.click(submitButton);

        expect(forgotSpy).toHaveBeenCalledWith(someEmail);
        expect(screen.getByTestId(errorId)).toBeInTheDocument()
        expect(localStorage.getItem('token')).toBeNull()
    });

    it('displays a message, displays the right email and disables the main button on successful sendPasswordResetEmail', async () => {
        const forgotSpy = jest.spyOn(defaultAPI, 'sendPasswordResetEmail');
        renderPage();
        forgotSpy.mockResolvedValueOnce(true)
        console.log("successful sendPasswordResetEmail", successResponse.json().payload, successResponse.json())
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, rightEmail);
        await userEvent.click(submitButton);

        expect(forgotSpy).toHaveBeenCalledWith(rightEmail);
        expect(screen.getByTestId(successMessage)).toBeInTheDocument()
        expect(screen.getByTestId(successEmail).textContent).toBe(rightEmail);
        expect(submitButton).toBeDisabled();
    });

});
