import { Link, usePage } from "@inertiajs/react";
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
} from "lucide-react";

const NavLink = ({ href, active, children, onClick }) => (
    <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
    >
        {children}
    </Link>
);

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
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
            roles: ["Super Admin", "Warehouse Manager", "Branch Manager"],
        },
        {
            name: "Locations",
            href: route("locations.index"),
            icon: MapPin,
            current: route().current("locations.*"),
            roles: ["Super Admin", "Warehouse Manager", "Branch Manager"],
        },
        {
            name: "Stock",
            href: route("stock.index"),
            icon: Warehouse,
            current: route().current("stock.*") && !route().current("stock-movements.*"),
            roles: ["Super Admin", "Warehouse Manager"],
        },
        {
            name: "Stock Movements",
            href: route("stock-movements.index"),
            icon: ArrowRightLeft,
            current: route().current("stock-movements.*"),
            roles: ["Super Admin", "Warehouse Manager"],
        },
        {
            name: "Transactions",
            href: route("transactions.index"),
            icon: ClipboardList,
            current: route().current("transactions.*"),
            roles: ["Super Admin", "Warehouse Manager", "Branch Manager"],
        },
        {
            name: "Supplier",
            href: route("suppliers.index"),
            icon: Truck,
            current: route().current("suppliers.*"),
            roles: ["Super Admin", "Warehouse Manager", "Branch Manager"],
        },
        {
            name: "Customers",
            href: route("customers.index"),
            icon: Contact,
            current: route().current("customers.*"),
            roles: ["Super Admin", "Branch Manager"],
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
        {
            name: "Types",
            href: route("types.index"),
            icon: Settings,
            current: route().current("types.*"),
            roles: ["Super Admin"],
        },
    ];

    const filteredNavLinks = navLinks.filter(
        (link) =>
            link.roles.length === 0 || link.roles.some((role) => hasRole(role))
    );

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            <div className="h-16 flex items-center justify-center px-4 border-b">
                <h1 className="text-xl font-bold text-foreground">Welcome!</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {filteredNavLinks.map((link) => (
                    <NavLink
                        key={link.name}
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
