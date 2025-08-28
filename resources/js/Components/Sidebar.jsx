import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Warehouse, BarChart2, Users } from 'lucide-react';

const NavLink = ({ href, active, children }) => (
    <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${active ? 'bg-secondary/20 text-primary font-semibold' : 'text-primary/70 hover:bg-secondary/10'
            }`}
    >
        {children}
    </Link>
);

export default function Sidebar({ sidebarOpen }) {
    const { auth } = usePage().props;

    const hasRole = (roleName) => auth.roles.includes(roleName);

    const navLinks = [
        { name: 'Halaman Utama', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard'), roles: [] },
        { name: 'Produk', href: route('products.index'), icon: Package, current: route().current('products.index'), roles: ['Super Admin'] },
        { name: 'Stok', href: '#', icon: Warehouse, current: false, roles: [] },
        { name: 'Laporan', href: '#', icon: BarChart2, current: false, roles: [] },
        { name: 'Manajemen User', href: route('users.index'), icon: Users, current: route().current('users.index'), roles: ['Super Admin'] },
    ];

    const filteredNavLinks = navLinks.filter(link =>
        link.roles.length === 0 || link.roles.some(role => hasRole(role))
    );

    return (
        <aside className={`w-64 bg-white shadow-lg flex-shrink-0 lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold text-primary">Welcome!</h1>
            </div>
            <nav className="p-4 space-y-2">
                {filteredNavLinks.map((link) => (
                    <NavLink key={link.name} href={link.href} active={link.current}>
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
