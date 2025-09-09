import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
  return (
    <nav className="mt-6 flex justify-center">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || '#'}
          preserveScroll
          className={`
                        mx-1 px-4 py-2 text-sm rounded-md transition-colors
                        ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'}
                        ${!link.url ? 'text-muted-foreground cursor-not-allowed' : ''}
                    `}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </nav>
  );
}
