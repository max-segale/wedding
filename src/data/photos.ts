import type { ImageMetadata } from 'astro';

export interface PhotoItem {
  file: string;
  caption?: string;
  size?: string;
}

export const photoCollections = {
  engaged: import.meta.glob<{ default: ImageMetadata }>('/src/assets/engaged/*'),
  wedding: import.meta.glob<{ default: ImageMetadata }>('/src/assets/wedding/*'),
  booth: import.meta.glob<{ default: ImageMetadata }>('/src/assets/booth/*'),
};

export const footerPhotos: PhotoItem[] = [
  {
    file: 'peekskill-boat.jpeg',
    caption: 'Peekskill boat ride',
  },
  {
    file: 'ski-mt.jpeg',
    caption: 'Our first ski trip in the Catskills',
  },
  {
    file: 'costa-rica-volcano.jpeg',
    caption: 'Arenal Volcano in Costa Rica',
    size: 'tall',
  },
  {
    file: 'costa-rica-scuba.jpeg',
    caption: 'Scuba diving in Costa Rica',
    size: 'large',
  },
  {
    file: 'key-west-sunset.jpeg',
    caption: 'Sunset cruise in Key West',
  },
  {
    file: 'plaza.jpeg',
    caption: 'Dressed sharp at the Plaza in NYC',
    size: 'tall',
  },
  {
    file: 'adk-hike.jpeg',
    caption: 'Lake George hike',
    size: 'wide',
  },
  {
    file: 'key-west-point.jpeg',
    caption: 'Southernmost point in Key West',
    size: 'large',
  },
  {
    file: 'flower-field.jpeg',
    caption: 'Among the wild flowers',
  },
  {
    file: 'backpack-kiss.jpeg',
    caption: 'Backpacking love',
    size: 'large',
  },
  {
    file: 'pond-skim.jpeg',
    caption: 'Post pond skim',
    size: 'tall',
  },
  {
    file: 'chickens.jpeg',
    caption: 'Family photo with our chickens',
  },
  {
    file: 'holiday-party.jpeg',
    caption: 'Engagement celebration',
  },
  {
    file: 'key-west-bikes.jpeg',
    caption: 'Biking around Key West',
  },
  {
    file: 'pumpkins.jpeg',
    caption: 'Getting autumnal',
  },
  {
    file: 'drinks.jpeg',
    caption: 'Having fun',
    size: 'top',
  },
  {
    file: 'lake-rock.jpeg',
    caption: 'Saranac Lake camping',
  },
  {
    file: 'saranac-sunset.jpeg',
    caption: 'Sunrise on Saranac Lake',
    size: 'row',
  },
];
