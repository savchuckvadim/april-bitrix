import { Suspense } from 'react';
import { LoginForm } from '@/modules/features/auth';

/**
 * Страница входа администратора. Suspense — из-за useSearchParams
 * (returnTo) в клиентской форме.
 */
export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
