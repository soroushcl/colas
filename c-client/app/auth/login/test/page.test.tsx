const mockFetch = jest.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

global.fetch = mockFetch;

// const localStorageMock = (() => {
//     let store: Record<string, string> = {};
//     return {
//         setItem: jest.fn((key, value) => {
//             store[key] = value;
//         }),
//         getItem: jest.fn((key) => store[key] || null),
//         clear: jest.fn(() => {
//             store = {};
//         }),
//     };
// })();
// Object.defineProperty(window, 'localStorage', {
//     value: localStorageMock,
// });

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ServiceProvider } from '@/providers/ServiceProviders';
import API from '@/services/api';
import userEvent from '@testing-library/user-event';
import Page from '../page';
import { AppRouterContextProviderMock } from '@/test/AppRouterContextMock';
import { createContext, useContext } from 'react';
import { UserStore } from '@/stores/userStore';
import { createMockApiResponse } from '@/test/responses';
import { RecipeStore } from '@/stores/recipeStore';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
jest.mock('../../../../stores/StoreContext', () => ({
    useStores: () => useContext(MockStoreContext),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const renderPage = () => {
    return render(
        <AppRouterContextProviderMock>
            <GoogleOAuthProvider clientId='698941654245-kqd42a2aqdi8ooet57fk8vfjbq6dlm4o.apps.googleusercontent.com'>
                <ServiceProvider api={defaultAPI}>
                    <MockStoreProvider>
                        <Page />
                    </MockStoreProvider>
                </ServiceProvider>
            </GoogleOAuthProvider>
        </AppRouterContextProviderMock>
    );
};

const passwordInputId = 'inner-password-input';
const errorId = 'error-text';

// const toggleButtonId = 'eye-button';
const somePassword = '123';
const someEmail = 'wrong@colaskitchen.com';
const rightEmail = 'soroush@colaskitchen.com';
const badEmail = 'bad.com';
const successResponse = createMockApiResponse({
    json: {
        success: true, payload: {
            user: {
                id: 'id',
                email: rightEmail,
                firstName: 'firstName',
                // lastName: 'lastName'
            },
            token: '123'
        }
    }
});
const failedResponse = createMockApiResponse({ error: 'Wrong credentials' });

describe('LoginPage', () => {
    it('matches the snapshot', () => {
        const page = renderPage();
        expect(page).toMatchSnapshot();
    });
});


describe('LogInPage - Email Input', () => {
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

describe('LogInPage - Password Input', () => {
    it('changes on user input', () => {
        renderPage();
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);

        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordInput.value).toBe('');

        fireEvent.change(passwordInput, { target: { value: somePassword } });

        expect(passwordInput.value).toBe(somePassword);
    });

    // it('displays the password when the eye is clicked', () => {
    //     renderPage();
    //     const button = screen.getByTestId(toggleButtonId);
    //     const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);

    //     expect(passwordInput).toHaveAttribute('type', 'password');

    //     fireEvent.click(button);

    //     expect(passwordInput).toHaveAttribute('type', 'text');
    // });
});

describe('LogInPage', () => {
    it('has empty fields and a disabled submit button on load', async () => {
        renderPage();

        const allTextBoxes: HTMLInputElement[] = screen.getAllByRole('textbox');
        const emailInput: HTMLInputElement = allTextBoxes[0];
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');

        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        // const eyeButton: HTMLButtonElement = allButtons[0];
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];
        // expect(eyeButton).toBeEnabled();
        expect(submitButton).toBeDisabled();
    });
});

describe('LogInPage', () => {
    it('does not enable submit when the form has a bad email', async () => {
        renderPage();
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, badEmail);
        expect(submitButton).toBeDisabled();

        await userEvent.type(passwordInput, somePassword);
        expect(submitButton).toBeDisabled();
    });
});

describe('LogInPage', () => {
    it('submit button is enabled when inputs are correct', async () => {
        renderPage();
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        expect(submitButton).toBeDisabled();

        await userEvent.type(emailInput, someEmail);
        await userEvent.type(passwordInput, somePassword);

        expect(submitButton).toBeEnabled();
    });
});

describe('LogInPage - (wrong credentials)', () => {
    it('displays an error message on failed login (wrong credentials)', async () => {
        const loginSpy = jest.spyOn(defaultAPI, 'login');
        renderPage();
        loginSpy.mockResolvedValueOnce(failedResponse.json().payload)
        console.log("(wrong credentials) failedResponse", failedResponse.json().payload, failedResponse.json())
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, someEmail);
        await userEvent.type(passwordInput, somePassword);
        await userEvent.click(submitButton);

        expect(loginSpy).toHaveBeenCalledWith(someEmail, somePassword, false);
        const errorMessage = await screen.findByTestId(errorId);
        expect(errorMessage).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBeNull()
    });
});

describe('LogInPage', () => {
    it('forward to "/" on successful login', async () => {
        const loginSpy = jest.spyOn(defaultAPI, 'login');
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        renderPage();
        loginSpy.mockResolvedValueOnce(successResponse.json().payload)
        const emailInput: HTMLInputElement = screen.getAllByRole('textbox')[0] as HTMLInputElement;
        const passwordInput: HTMLInputElement = screen.getByTestId(passwordInputId);
        const allButtons: HTMLButtonElement[] = screen.getAllByRole('button');
        const submitButton: HTMLButtonElement = allButtons[allButtons.length - 1];

        await userEvent.type(emailInput, rightEmail);
        await userEvent.type(passwordInput, somePassword);
        await userEvent.click(submitButton);

        expect(loginSpy).toHaveBeenCalledWith(rightEmail, somePassword, false);
        expect(pushMock).toHaveBeenCalledWith('/');
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

});
