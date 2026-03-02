'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
    Wallet,
    CreditCard,
    Receipt,
    LineChart,
    Briefcase,
    FolderOpen,
    DollarSign,
    ClipboardList,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    X,
    User as UserIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigation = [
    {
        name: 'Budget',
        section: 'budget',
        items: [
            { name: 'Overview', href: '/budget', icon: Wallet },
            { name: 'Transactions', href: '/budget/transactions', icon: Receipt },
            { name: 'Abonnements', href: '/budget/subscriptions', icon: CreditCard },
            { name: 'Graphiques', href: '/budget/graph', icon: LineChart },
        ],
    },
    {
        name: 'Freelance',
        section: 'freelance',
        items: [
            { name: 'Overview', href: '/freelance', icon: Briefcase },
            { name: 'Portfolio', href: '/freelance/portfolio', icon: FolderOpen },
            { name: 'Revenus', href: '/freelance/income', icon: DollarSign },
            { name: 'Projets', href: '/freelance/projects', icon: ClipboardList },
        ],
    },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [expanded, setExpanded] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo-the-station.jpg"
                        alt="The Station"
                        width={28}
                        height={28}
                        className="rounded-md"
                    />
                    <span className="text-sm font-semibold">The Station</span>
                </Link>
                <div className="flex items-center gap-2">
                    {session?.user && (
                        <button onClick={() => router.push('/account')} className="flex items-center">
                            {session.user.avatar_url ? (
                                <Image
                                    src={session.user.avatar_url}
                                    alt={session.user.name || 'User'}
                                    width={32}
                                    height={32}
                                    className="aspect-square rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <aside
                className={cn(
                    'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-60 border-r border-border bg-background transition-transform duration-200 md:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-4">
                    {navigation.map((item) => {
                        if ('items' in item) {
                            const isBudget = item.section === 'budget';
                            const isFreelance = item.section === 'freelance';

                            return (
                                <div key={item.name} className="mb-4">
                                    <h3
                                        className={cn(
                                            'mb-2 px-3 text-[11px] font-bold uppercase tracking-wider',
                                            isBudget && 'text-budget',
                                            isFreelance && 'text-freelance',
                                        )}
                                    >
                                        {item.name}
                                    </h3>
                                    <ul className="space-y-0.5">
                                        {item.items!.map((subItem) => {
                                            const isActive = pathname === subItem.href;
                                            const Icon = subItem.icon;

                                            return (
                                                <li key={subItem.href}>
                                                    <Link
                                                        href={subItem.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={cn(
                                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                                                            isActive &&
                                                                isBudget &&
                                                                'bg-budget/10 text-budget-light font-medium',
                                                            isActive &&
                                                                isFreelance &&
                                                                'bg-freelance/10 text-freelance-light font-medium',
                                                            !isActive &&
                                                                'text-muted-foreground hover:text-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {subItem.name}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        }
                    })}
                </nav>

                <div className="border-t border-border p-3">
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
                            'text-muted-foreground transition-colors duration-150',
                            'hover:text-red-400 hover:bg-red-400/10',
                        )}
                    >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-background transition-all duration-200 md:flex md:flex-col',
                    expanded ? 'w-60' : 'w-17',
                )}
            >
                <div className="flex h-full flex-col">
                    <div className={cn('flex h-16 items-center shrink-0', expanded ? 'px-5' : 'justify-center px-2')}>
                        <Link href="/" className="flex items-center gap-2.5">
                            <Image
                                src="/logo-the-station.jpg"
                                alt="The Station"
                                width={28}
                                height={28}
                                className="rounded-md shrink-0"
                            />
                            {expanded && (
                                <span className="text-base font-semibold tracking-tight whitespace-nowrap">
                                    The Station
                                </span>
                            )}
                        </Link>
                    </div>

                    <nav className={cn('flex-1 space-y-1 overflow-y-auto pt-2', expanded ? 'px-3' : 'px-2')}>
                        {navigation.map((item) => {
                            if ('items' in item) {
                                const isBudget = item.section === 'budget';
                                const isFreelance = item.section === 'freelance';

                                return (
                                    <div key={item.name} className="mb-4">
                                        {expanded && (
                                            <h3
                                                className={cn(
                                                    'mb-2 px-3 text-[11px] font-bold uppercase tracking-wider',
                                                    isBudget && 'text-budget',
                                                    isFreelance && 'text-freelance',
                                                )}
                                            >
                                                {item.name}
                                            </h3>
                                        )}
                                        <ul className="space-y-1">
                                            {item.items!.map((subItem) => {
                                                const isActive = pathname === subItem.href;
                                                const Icon = subItem.icon;

                                                return (
                                                    <li key={subItem.href}>
                                                        <Link
                                                            href={subItem.href}
                                                            title={!expanded ? subItem.name : undefined}
                                                            className={cn(
                                                                'flex items-center rounded-lg text-sm transition-colors duration-150',
                                                                expanded ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5',
                                                                isActive &&
                                                                    isBudget &&
                                                                    'bg-budget/10 text-budget-light font-medium',
                                                                isActive &&
                                                                    isFreelance &&
                                                                    'bg-freelance/10 text-freelance-light font-medium',
                                                                !isActive &&
                                                                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                                                            )}
                                                        >
                                                            <Icon className="h-4 w-4 shrink-0" />
                                                            {expanded && subItem.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            }
                        })}
                    </nav>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? 'Réduire' : 'Agrandir'}
                        className={cn(
                            'flex items-center rounded-lg text-sm transition-colors duration-150',
                            'text-muted-foreground hover:text-foreground hover:bg-muted',
                            expanded ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5',
                        )}
                    >
                        {expanded ? (
                            <>
                                <PanelLeftClose className="h-4 w-4 shrink-0" />
                                Réduire
                            </>
                        ) : (
                            <PanelLeftOpen className="h-4 w-4" />
                        )}
                    </button>

                    <div className={cn('border-t border-border mt-2 p-2')}>
                        {session?.user && (
                            <button
                                onClick={() => router.push('/account')}
                                className={cn(
                                    'flex px-3 py-2 w-full items-center rounded-lg transition-all duration-150 hover:bg-muted hover:text-foreground',
                                    expanded ? 'gap-3' : 'justify-center',
                                )}
                            >
                                {session.user.avatar_url ? (
                                    <Image
                                        src={session.user.avatar_url}
                                        alt={session.user.name || 'User'}
                                        width={24}
                                        height={24}
                                        className="aspect-square rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <UserIcon className="h-6 w-6" />
                                    </div>
                                )}
                                {expanded && (
                                    <p className="text-sm text-end text-muted-foreground truncate">
                                        {session.user.name}
                                    </p>
                                )}
                            </button>
                        )}
                        <button
                            onClick={handleSignOut}
                            className={cn(
                                'flex w-full items-center rounded-lg text-sm',
                                'text-muted-foreground transition-colors duration-150',
                                'hover:text-red-400 hover:bg-red-400/10 px-3 py-2',
                                expanded ? 'gap-3' : 'justify-center',
                            )}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {expanded && 'Déconnexion'}
                        </button>
                    </div>
                </div>
            </aside>

            <div
                className={cn(
                    'min-h-screen bg-background transition-all duration-200 ease-in-out',
                    'p-4 pt-20 pb-20 md:p-8 md:pt-8 md:pb-8',
                    expanded ? 'md:ml-60' : 'md:ml-17',
                )}
            >
                {children}
            </div>
        </>
    );
}
