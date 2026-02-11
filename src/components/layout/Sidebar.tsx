'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    Receipt,
    LineChart,
    Briefcase,
    FolderOpen,
    DollarSign,
    ClipboardList,
    LogOut,
    Globe,
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
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

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-background">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center px-5">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Globe className="h-6 w-6 text-foreground" />
                        <span className="text-base font-semibold tracking-tight">The Station</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
                    {navigation.map((item) => {
                        if ('items' in item) {
                            const isBudget = item.section === 'budget';
                            const isFreelance = item.section === 'freelance';

                            return (
                                <div key={item.name} className="mb-4">
                                    <h3
                                        className={cn(
                                            'mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
                                            isBudget && 'text-budget/70',
                                            isFreelance && 'text-freelance/70',
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
                                                        className={cn(
                                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
                                                            'transition-colors duration-150',

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

                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm mb-2',
                                    'transition-colors duration-150',

                                    isActive && 'bg-foreground/10 text-foreground font-medium',
                                    !isActive && 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-3">
                    <button
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
            </div>
        </aside>
    );
}
