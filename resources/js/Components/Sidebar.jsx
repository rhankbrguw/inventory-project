import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    BarChart2,
    Users,
    Truck,
} from "lucide-react";

const NavLink = ({ href, active, children }) => (
    <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
            active
                ? "bg-secondary/20 text-primary font-semibold"
                : "text-primary/70 hover:bg-secondary/10"
        }`}
    >
        {children}
    </Link>
);

export default function Sidebar({ sidebarOpen }) {
    const { auth } = usePage().props;

    const hasRole = (roleName) => auth.user.roles.includes(roleName);

    const navLinks = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: LayoutDashboard,
            current: route().current("dashboard"),
            roles: [],
        },
        {
            name: "Product",
            href: route("products.index"),
            icon: Package,
            current: route().current("products.*"),
            roles: ["Super Admin", "Branch Manager"],
        },
        {
            name: "Stock",
            href: route("stock.index"),
            icon: Warehouse,
            current: route().current("stock.*"),
            roles: ["Super Admin", "Warehouse Manager"],
        },
        {
            name: "Supplier",
            href: route("suppliers.index"),
            icon: Truck,
            current: route().current("suppliers.*"),
            roles: ["Super Admin", "Warehouse Manager"],
        },
        {
            name: "Report",
            href: "#",
            icon: BarChart2,
            current: false,
            roles: [],
        },
        {
            name: "Users",
            href: route("users.index"),
            icon: Users,
            current: route().current("users.*"),
            roles: ["Super Admin"],
        },
    ];

    const filteredNavLinks = navLinks.filter(
        (link) =>
            link.roles.length === 0 || link.roles.some((role) => hasRole(role))
    );

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold text-primary">Welcome!</h1>
            </div>
            <nav className="p-4 space-y-2">
                {filteredNavLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        href={link.href}
                        active={link.current}
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
