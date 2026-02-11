import { Sidebar } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <Sidebar>{children}</Sidebar>;
}
