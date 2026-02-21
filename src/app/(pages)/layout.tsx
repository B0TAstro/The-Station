import { Sidebar } from '@/components/shared/global';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return <Sidebar>{children}</Sidebar>;
}
