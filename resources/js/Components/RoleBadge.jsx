export default function RoleBadge({ role }) {
    if (!role) {
        return <span>-</span>;
    }

    const getRoleClass = (roleName) => {
        const roleClassMap = {
            "Super Admin": "role-super-admin",
            "Warehouse Manager": "role-warehouse-manager",
            "Branch Manager": "role-branch-manager",
            Cashier: "role-cashier",
        };

        return roleClassMap[roleName] || "role-default";
    };

    return (
        <span
            className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${getRoleClass(
                role.name
            )}`}
        >
            {role.name}
        </span>
    );
}
