import App from '@/modules/app/ui/App';

export default function KonstructorPage() {
    const inBitrix = process.env.IN_BITRIX as string | boolean | undefined

    return <App inBitrix={true} envBitrix={inBitrix} />;
} 