import { Sidebar } from '@/components/global';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return <Sidebar>{children}</Sidebar>;
}
