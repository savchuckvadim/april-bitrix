import { redirect } from 'next/navigation';
import { publicBasePath } from '@/modules/public-app/lib/public-flow';
import { KONSTRUCTOR_ROUTE_PATH, ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing/routes';

/** Вход по ссылке сразу ведёт на первый шаг сборки. */
export default async function PublicEntryPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    redirect(
        `${publicBasePath(token)}${KONSTRUCTOR_ROUTE_PATH[ROUTE_KONSTRUCTOR.PARAMS]}`,
    );
}
