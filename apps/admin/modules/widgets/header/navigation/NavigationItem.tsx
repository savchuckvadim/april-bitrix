'use client';
import Link from "next/link";

export interface INavigationItemProps {
    isActive: boolean;
    href: string;
    title: string;

}
export const NavigationItem = ({ isActive, href, title }: INavigationItemProps) => {

    return (<Link href={href} className={isActive ? 'text-primary' : 'text-gray-500'}>{title}</Link>);
}
