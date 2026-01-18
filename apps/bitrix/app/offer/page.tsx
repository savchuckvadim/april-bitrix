import React from 'react';
import { Header } from '../(app)/home/components/Header';
import { Footer } from '../(app)/home/components/Footer';
import { OfferContent } from './components/OfferContent';
import { PrintStyles } from './components/PrintStyles';

export const metadata = {
    title: 'Коммерческое предложение — April CRM для партнёров ГАРАНТ',
    description:
        'Полная настройка автоматизации отдела продаж на базе Битрикс24 для партнёров ГАРАНТ. Внедрение, интеграции и поддержка.',
};

export default function OfferPage() {
    return (
        <>
            <PrintStyles />
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-grow">
                    <OfferContent />
                </main>
                <div className="w-full flex justify-center items-center">
                    <div className="w-1/2 ">
                        <div style={{
                            position: 'relative', width: '100%', height: '0', paddingTop: '100.0000%',
                            "paddingBottom": '0', boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)', marginTop: '1.6em', marginBottom: '0.9em', overflow: 'hidden',
                            borderRadius: '8px', willChange: 'transform',
                        }}>
                            <iframe loading="lazy" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none', padding: 0, margin: 0 }} src="https://www.canva.com/design/DAG5UjCP-PQ/wRQaDLE6G3nk-u9nMS3-jQ/view?embed" allowFullScreen={true} allow="fullscreen" />
                        </div>
                        {/* <a href="https://www.canva.com/design/DAG5UjCP-PQ/wRQaDLE6G3nk-u9nMS3-jQ/view?utm_content=DAG5UjCP-PQ&utm_campaign=designshare&utm_medium=embeds&utm_source=link" target="_blank" rel="noopener">Magic Write</a> автор: Вадим Савчук */}
                    </div>
                </div>
                <Footer />

            </div>
        </>
    );
}



