import Image from 'next/image';
import Link from 'next/link';
import { PLATFORM_BRAND } from '../platform/model/copy';
import { PLATFORM_ROOT } from '../platform/model/navigation';

/** Логотип раздела: ведёт на обзор сервисов. */
export function LandingLogo() {
    return (
        <Link href={PLATFORM_ROOT} className="flex items-center gap-2">
            <Image src="/logo/logo.svg" alt="" width={40} height={40} className="h-9 w-auto" />
            <span className="text-xl font-bold tracking-tight text-primary">{PLATFORM_BRAND}</span>
        </Link>
    );
}
