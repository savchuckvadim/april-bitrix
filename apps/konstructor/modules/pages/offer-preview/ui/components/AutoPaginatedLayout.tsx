'use client'
import React, { useEffect, useRef, useState } from 'react';
import "@/style/print.css"
const A4_HEIGHT_PX = 1000; // 1122 =~297mm при 96dpi

type AutoPaginatedLayoutProps = {
    blocks: React.ReactNode[];
    editable?: boolean;
};

export const AutoPaginatedLayout: React.FC<AutoPaginatedLayoutProps> = ({ blocks, editable }) => {
    const [pages, setPages] = useState<React.ReactNode[][]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    console.log('AutoPaginatedLayout editable', editable);
    useEffect(() => {
        const measureAndPaginate = async () => {
            if (!containerRef.current) return;

            const children = Array.from(containerRef.current.children);
            const pageList: React.ReactNode[][] = [];
            let currentPage: React.ReactNode[] = [];
            let currentHeight = 0;
            // let pageHeights: number[] = [];

            for (let i = 0; i < children.length; i++) {
                const el = children[i] as HTMLElement;
                const height = el.offsetHeight;

                if (currentHeight + height > A4_HEIGHT_PX) {
                    pageList.push(currentPage);
                    // pageHeights.push(currentHeight);
                    currentPage = [];
                    currentHeight = 0;
                }

                currentPage.push(blocks[i]);
                currentHeight += height;
            }
            // const remainingHeight = A4_HEIGHT_PX - (pageHeights?.[pageHeights.length - 1] || 0);
            // console.log('remainingHeight', remainingHeight);
            // if (remainingHeight > 10) {
            //     // Например, если осталось 150px или больше — добавляем логотип
            //     const filler = (
            //         <div style={{ height: 50 }} className="flex items-center justify-end me-4">
            //             <img src="/logo/garant.png" alt="Логотип" className="h-14" />
            //         </div>
            //     );
            //     pageList && pageList.length && pageList?.[pageList.length - 1]?.push(filler);
            // }
            if (currentPage.length > 0) {
                pageList.push(currentPage);
            }

            setPages(pageList);
        };

        // Timeout — чтобы DOM успел отрендериться
        setTimeout(measureAndPaginate, 0);
    }, [blocks]);

    return (
        <>
            {/* Скрытая обёртка для измерения */}
            <div
                data-measure
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '0',
                    width: '210mm',
                    pointerEvents: 'none',
                    visibility: 'hidden', // <== добавлено

                }}
                ref={containerRef}>
                {blocks.map((block, index) => (
                    <div key={index} className="mb-2">
                        {block}
                    </div>
                ))}
            </div>


            {pages.filter((page) => page.length > 0).map((pageBlocks, pageIndex) => (
                <div
                    key={pageIndex}
                    className={`pdf-page w-[210mm] h-[297mm] mx-auto  bg-white overflow-hidden  ${editable ? 'my-4  border-1 border-gray-300 ' : ''}`}
                >
                    {pageBlocks.map((block, i) => (
                        <div key={i} className="mb-2">
                            {block}
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
};

export default AutoPaginatedLayout;
