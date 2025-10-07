'use client'
import { StoreProvider } from '../../stores/StoreContext';
// import Header from '../header/Header';
// import MainButton from '../mainButton/MainButton';
import { ServiceProvider } from '@/providers/ServiceProviders';
import FetchApi from '@/services/api';
// import Header from '../header/Header';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Image from 'next/image';

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
                        <div className='my-0 mx-auto min-h-screen max-h-screen flex flex-col justify-between relative'>
                            <Image
                                src={`/images/bg-protein.png`}
                                width={200}
                                height={200}
                                className="object-fit absolute grow right-0 top-[160px] h-[200px] w-[200px]"
                                alt={"Cola"}
                            />
                            <Image
                                src={`/images/bg-left.png`}
                                width={180}
                                height={360}
                                className="object-fit absolute left-0 top-[160px] h-[360px] w-[180px]"
                                alt={"Cola"}
                            />
                            <Image
                                src={`/images/bg-ld.png`}
                                width={240}
                                height={240}
                                className="object-fit absolute left-0 top-[660px] h-[240px] w-[240px]"
                                alt={"Cola"}
                            />
                            <Image
                                src={`/images/bg-br.png`}
                                width={180}
                                height={360}
                                className="object-fit absolute right-[0px] bottom-[40px] h-[360px] w-[180px]"
                                alt={"Cola"}
                            />
                            <div className='absolute w-full h-[100vh] flex justify-center items-center overflow-hidden'>
                                <Image
                                    src={`/images/bg-circle-full.png`}
                                    width={770}
                                    height={770}
                                    className="object-fit absolute h-[770px] w-[770px] top-[140px]"
                                    alt={"Cola"}
                                />
                                <Image
                                    src={`/images/bg-circle-dotted.png`}
                                    width={810}
                                    height={810}
                                    className="object-fit absolute h-[810px] w-[810px] top-[120px]"
                                    alt={"Cola"}
                                />
                                <Image
                                    src={`/images/bg-circle-dotted.png`}
                                    width={730}
                                    height={730}
                                    className="object-fit absolute h-[730px] w-[730px] top-[160px]"
                                    alt={"Cola"}
                                />
                            </div>
                            {children}
                        </div >
                    </StoreProvider>
                </ServiceProvider>
            </GoogleOAuthProvider>
        </>
    );
}