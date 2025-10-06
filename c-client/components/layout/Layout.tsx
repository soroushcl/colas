'use client'
import { StoreProvider } from '../../stores/StoreContext';
// import Header from '../header/Header';
// import MainButton from '../mainButton/MainButton';
import { ServiceProvider } from '@/providers/ServiceProviders';
import FetchApi from '@/services/api';
// import Header from '../header/Header';
import { GoogleOAuthProvider } from '@react-oauth/google';

const api = new FetchApi();

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <GoogleOAuthProvider clientId='698941654245-kqd42a2aqdi8ooet57fk8vfjbq6dlm4o.apps.googleusercontent.com'>

                <ServiceProvider api={api}>
                    <StoreProvider >
                        <div className='my-0 mx-auto min-h-screen max-h-screen flex flex-col justify-between'>
                            {children}
                        </div >
                    </StoreProvider>
                </ServiceProvider>
            </GoogleOAuthProvider>
        </>
    );
}