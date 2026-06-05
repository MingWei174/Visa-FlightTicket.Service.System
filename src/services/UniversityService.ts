export interface University {
  name: string;
  country: string;
  alpha_two_code: string;
  web_pages: string[];
  domains: string[];
}

export interface UniversityDetails {
  extract: string;
  thumbnailUrl: string | null;
}

export const UniversityService = {
  /**
   * Fetch all universities in a specific country
   */
  async getUniversitiesByCountry(countryName: string): Promise<University[]> {
    try {
      // Clean up the country name (extract English part if format is "Japan 日本")
      let queryName = countryName.split(' ')[0];
      
      // Override specific ones
      if (queryName.includes('US') || queryName.includes('U.S.A') || queryName.includes('美國')) queryName = 'United States';
      if (queryName.includes('UK') || queryName.includes('英國')) queryName = 'United Kingdom';
      if (queryName.includes('Korea') || queryName.includes('韓國') || queryName.includes('南韓')) queryName = 'Korea, Republic of';
      if (queryName.includes('Japan') || queryName.includes('日本')) queryName = 'Japan';
      if (queryName.includes('Canada') || queryName.includes('加拿大')) queryName = 'Canada';
      if (queryName.includes('Germany') || queryName.includes('德國')) queryName = 'Germany';
      if (queryName.includes('France') || queryName.includes('法國')) queryName = 'France';

      console.log('Querying Hipolabs with:', queryName);

      const response = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(queryName)}`);
      if (!response.ok) throw new Error('API response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      return [];
    }
  },

  /**
   * Fetch university details (description & image) from Wikipedia
   */
  async getUniversityDetails(universityName: string): Promise<UniversityDetails> {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(universityName)}&format=json&origin=*&pithumbsize=800`
      );
      const data = await response.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1') {
          const page = pages[pageId];
          return {
            extract: page.extract || '此學校目前在維基百科上尚無詳細的介紹摘要。',
            thumbnailUrl: page.thumbnail?.source || null
          };
        }
      }
      
      return { extract: '此學校目前在維基百科上尚無詳細的介紹摘要。', thumbnailUrl: null };
    } catch (error) {
      console.error('Failed to fetch university details:', error);
      return { extract: '獲取簡介失敗。', thumbnailUrl: null };
    }
  },

  /**
   * Fetch a real image of the country from Wikipedia
   */

  /**
   * Fetch a real image of the country from Wikipedia
   */
  async getCountryInfo(countryName: string): Promise<{lat: number, lng: number, flag: string} | null> {
    try {
      let queryName = countryName.split(' ')[0];
      if (queryName.includes('US') || queryName.includes('U.S.A') || queryName.includes('美國')) queryName = 'USA';
      if (queryName.includes('UK') || queryName.includes('英國')) queryName = 'UK';
      if (queryName.includes('Korea') || queryName.includes('韓國') || queryName.includes('南韓')) queryName = 'South Korea';
      if (queryName.includes('Japan') || queryName.includes('日本')) queryName = 'Japan';
      if (queryName.includes('Canada') || queryName.includes('加拿大')) queryName = 'Canada';

      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(queryName)}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: data[0].latlng[0],
          lng: data[0].latlng[1],
          flag: data[0].flags?.svg || data[0].flags?.png
        };
      }
    } catch (e) {
      console.error('Failed to fetch country info', e);
    }
    return null;
  },

  async getCountryBackgroundImage(countryName: string): Promise<string> {
    try {
      let queryName = countryName.split(' ')[0];
      if (queryName.includes('US') || queryName.includes('U.S.A') || queryName.includes('美國')) queryName = 'United States';
      if (queryName.includes('UK') || queryName.includes('英國')) queryName = 'United Kingdom';
      if (queryName.includes('Korea') || queryName.includes('韓國') || queryName.includes('南韓')) queryName = 'South Korea'; // Wikipedia expects South Korea
      if (queryName.includes('Japan') || queryName.includes('日本')) queryName = 'Japan';
      if (queryName.includes('Canada') || queryName.includes('加拿大')) queryName = 'Canada';

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(queryName)}&format=json&origin=*&pithumbsize=1000`
      );
      const data = await response.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    } catch (e) {
      console.error('Failed to fetch country image', e);
    }
    
    // Fallback to picsum if wiki fails
    let seed = 0;
    for(let i=0; i<countryName.length; i++) {
        seed += countryName.charCodeAt(i);
    }
    return `https://picsum.photos/seed/${seed}/1920/1080?blur=2`;
  }
};
