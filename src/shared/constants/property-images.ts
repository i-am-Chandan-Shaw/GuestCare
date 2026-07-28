/** Mock storefront / exterior photos for property cards. */
export const PROPERTY_IMAGE_URLS: Record<string, string> = {
  almorah:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=240&h=240&q=80",
  battersea:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=240&h=240&q=80",
  "bedford-c":
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=240&h=240&q=80",
  "bedford-d":
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=240&h=240&q=80",
  bermondsey:
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=240&h=240&q=80",
  borough:
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=240&h=240&q=80",
  "chalk-farm":
    "https://images.unsplash.com/photo-1501183638710-e861ed-aec6?auto=format&fit=crop&w=240&h=240&q=80",
  clerkenwell:
    "https://images.unsplash.com/photo-1560448204-e02f11c45772?auto=format&fit=crop&w=240&h=240&q=80",
  "exchange-gardens":
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=240&h=240&q=80",
  farringdon:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=240&h=240&q=80",
  fulham:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=240&h=240&q=80",
  hampstead:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=240&h=240&q=80",
  marylebone:
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=240&h=240&q=80",
  mayfair:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=240&h=240&q=80",
  neckinger:
    "https://images.unsplash.com/photo-1605276374104-de6862b9a2a6?auto=format&fit=crop&w=240&h=240&q=80",
  "notting-hill":
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=240&h=240&q=80",
  "paddington-11":
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=240&h=240&q=80",
  "paddington-12":
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=240&h=240&q=80",
  pembridge:
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=240&h=240&q=80",
  "royal-oak":
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=240&h=240&q=80",
  "shepherds-bush":
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=240&h=240&q=80",
  "third-avenue":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=240&h=240&q=80",
  "union-street":
    "https://images.unsplash.com/photo-1600047509358-adc6d9f3a3d4?auto=format&fit=crop&w=240&h=240&q=80",
  vauxhall:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=240&h=240&q=80",
};

export function getPropertyImageUrl(propertyId: string): string | undefined {
  return PROPERTY_IMAGE_URLS[propertyId];
}
