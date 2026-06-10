'use client';
import Link from "next/link";

export interface INavigationItemProps {
    isActive: boolean;
    href: string;
    title: string;
    onClick: () => void;
}
export const PortalNavigation = ({ isActive, href, title, onClick }: INavigationItemProps) => {

    return (<Link href={href} onClick={onClick} className={isActive ? 'text-primary' : 'text-gray-500'}>{title}</Link>);
}
