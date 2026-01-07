import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { usePermission } from '@/hooks/usePermission';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    BarChart2,
    Users,
    Truck,
    Settings,
    ClipboardList,
    MapPin,
    Contact,
    ArrowRightLeft,
} from 'lucide-react';

const NavLink = ({ href, active, children, onClick }) => (
    <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
    >
        {children}
    </Link>
);

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { t } = useTranslation();

    const { user, can } = usePermission();

    if (!user) return null;

    const navLinks = [
        {
            name: t('ui.dashboard'),
            href: route('dashboard'),
            icon: LayoutDashboard,
            current: route().current('dashboard'),
            show: can.view_dashboard,
        },
        {
            name: t('ui.product'),
            href: route('products.index'),
            icon: Package,
            current: route().current('products.*'),
            show: can.view_products,
        },
        {
            name: t('ui.locations'),
            href: route('locations.index'),
            icon: MapPin,
            current: route().current('locations.*'),
            show: can.view_locations,
        },
        {
            name: t('ui.stock'),
            href: route('stock.index'),
            icon: Warehouse,
            current:
                route().current('stock.*') &&
                !route().current('stock-movements.*'),
            show: can.view_inventory,
        },
        {
            name: t('ui.stock_movements'),
            href: route('stock-movements.index'),
            icon: ArrowRightLeft,
            current: route().current('stock-movements.*'),
            show: can.view_stock_movements,
        },
        {
            name: t('ui.transactions'),
            href: route('transactions.index'),
            icon: ClipboardList,
            current: route().current('transactions.*'),
            show: can.view_transactions,
        },
        {
            name: t('ui.suppliers'),
            href: route('suppliers.index'),
            icon: Truck,
            current: route().current('suppliers.*'),
            show: can.view_suppliers,
        },
        {
            name: t('ui.customers'),
            href: route('customers.index'),
            icon: Contact,
            current: route().current('customers.*'),
            show: can.view_customers,
        },
        {
            name: t('ui.reports'),
            href: route('reports.index'),
            icon: BarChart2,
            current: route().current('reports.*'),
            show: can.view_reports,
        },
        {
            name: t('ui.users'),
            href: route('users.index'),
            icon: Users,
            current: route().current('users.*'),
            show: can.manage_system,
        },
        {
            name: t('ui.types'),
            href: route('types.index'),
            icon: Settings,
            current: route().current('types.*'),
            show: can.manage_system,
        },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
        >
            <div className="h-16 flex items-center justify-center px-4 border-b">
                <h1 className="text-xl font-bold text-foreground">
                    {t('ui.welcome')}
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navLinks
                    .filter((link) => link.show)
                    .map((link) => (
                        <NavLink
                            key={link.href}
                            href={link.href}
                            active={link.current}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
}
