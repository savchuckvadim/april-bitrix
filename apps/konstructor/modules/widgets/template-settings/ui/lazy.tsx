import dynamic from 'next/dynamic';
import { TemplateSettingsFallback } from './TemplateSettingsFallback';

/** Шаблоны счетов открываются по переключателю: их код не нужен витрине КП. */
export const LazyInvoiceTemplatesScreen = dynamic(
    () =>
        import('@/modules/widgets/invoice-templates').then(
            module => module.InvoiceTemplatesScreen,
        ),
    { loading: () => <TemplateSettingsFallback /> },
);
