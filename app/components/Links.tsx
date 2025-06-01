import { Link } from '@prisma/client';

interface LinksProps {
  links: Link[];
}

export function Links({ links }: LinksProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/90">No links added yet.</p>
      </div>
    );
  }

  return (
    <>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full p-4 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{link.title}</span>
            <span className="text-white/60">→</span>
          </div>
        </a>
      ))}
    </>
  );
} 