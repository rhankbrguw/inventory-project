import { Link } from '@inertiajs/react';
import { Button } from './ui/button';

export default function Pagination({ links }) {
  return (
    <nav className="mt-6 flex justify-center">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || '#'}
          preserveScroll
          className={`
                        mx-1 px-4 py-2 text-sm rounded-md
                        ${link.active ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}
                        ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}
                    `}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </nav>
  );
}
