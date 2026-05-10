import { memo } from 'react';
import { Profile } from '../types';
import { ArtistProfile } from '../features/shared/profile/ArtistProfile';
import { SectionHeader } from './SectionHeader';

interface ArtistSpotlightGridProps {
  title?: string;
  artists: Profile[];
  rows?: 2 | 3;
  variant?: 'default' | 'featured';
  containerClassName?: string;
}

export const ArtistSpotlightGrid = memo(function ArtistSpotlightGrid({
  title,
  artists,
  rows = 3,
  variant = 'default',
  containerClassName = '',
}: ArtistSpotlightGridProps) {
  if (!artists || artists.length === 0) return null;

  const rowsClass = rows === 2 ? 'grid-rows-2' : 'grid-rows-3';
  const colsClass = variant === 'featured' ? 'auto-cols-[200px] md:auto-cols-[320px]' : 'auto-cols-[250px] md:auto-cols-[300px]';

  return (
    <section className={containerClassName}>
      {title && (
        <div className="px-4 md:px-8">
          <SectionHeader 
            title={title} 
            containerClassName="mb-6" 
          />
        </div>
      )}
      <div className="overflow-x-auto no-scrollbar pb-2 px-4 md:px-8">
        <div className={`grid grid-flow-col gap-2 w-max ${rowsClass} ${colsClass}`}>
          {artists.map((artist, idx) => (
            <ArtistProfile 
              key={`${artist.id}-${idx}`} 
              artist={artist} 
              index={idx} 
              variant={variant} 
            />
          ))}
        </div>
      </div>
    </section>
  );
});
