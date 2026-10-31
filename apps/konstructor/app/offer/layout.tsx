import { Providers } from '@/modules/app/providers';
import { App } from '@/modules/app/ui/App';

/** Замороженный HTML-КП стек (решение владельца): те же стор и гейт, что у фрейма. */
export default function OfferLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <App>{children}</App>
        </Providers>
    );
}
