import type { PlatformService } from '../model/types';
import { ServiceCard } from './ServiceCard';

export interface ServiceGridProps {
    services: readonly PlatformService[];
}

/** Сетка карточек сервисов: на главной раздела и в «работает в паре». */
export function ServiceGrid({ services }: ServiceGridProps) {
    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map(service => (
                <ServiceCard key={service.slug} service={service} />
            ))}
        </div>
    );
}
