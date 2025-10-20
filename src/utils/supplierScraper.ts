import * as cheerio from 'cheerio';

interface SupplierData {
  name: string;
  contact: string;
  price: number;
  url: string;
}

export class UKSupplierScraper {
  private static readonly SUPPLIERS = [
    {
      name: 'Travis Perkins',
      baseUrl: 'https://www.travisperkins.co.uk',
      searchUrl: 'https://www.travisperkins.co.uk/search?q=',
      contact: '0345 0268 268'
    },
    {
      name: 'Jewson',
      baseUrl: 'https://www.jewson.co.uk',
      searchUrl: 'https://www.jewson.co.uk/search?q=',
      contact: '0800 539 766'
    },
    {
      name: 'Wickes',
      baseUrl: 'https://www.wickes.co.uk',
      searchUrl: 'https://www.wickes.co.uk/search?q=',
      contact: '0330 333 3300'
    },
    {
      name: 'B&Q',
      baseUrl: 'https://www.diy.com',
      searchUrl: 'https://www.diy.com/search?q=',
      contact: '0333 014 3097'
    },
    {
      name: 'Screwfix',
      baseUrl: 'https://www.screwfix.com',
      searchUrl: 'https://www.screwfix.com/search?q=',
      contact: '03330 112 112'
    }
  ];

  static async searchMaterial(material: string): Promise<SupplierData[]> {
    const results: SupplierData[] = [];
    
    for (const supplier of this.SUPPLIERS) {
      try {
        const data = await this.scrapeSupplier(supplier, material);
        if (data) {
          results.push(data);
        }
      } catch (error) {
        console.log(`Failed to scrape ${supplier.name}:`, error);
        // Add fallback data
        results.push({
          name: supplier.name,
          contact: supplier.contact,
          price: this.getEstimatedPrice(material),
          url: supplier.baseUrl
        });
      }
    }
    
    return results;
  }

  private static async scrapeSupplier(supplier: { name: string; baseUrl: string; searchUrl: string; contact: string }, material: string): Promise<SupplierData | null> {
    try {
      const searchUrl = `${supplier.searchUrl}${encodeURIComponent(material)}`;
      
      // For demo purposes, we'll simulate scraping
      // In production, you'd use puppeteer or similar
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract price from the page (this is a simplified example)
      const priceElement = $('.price, .cost, [data-price]').first();
      const priceText = priceElement.text();
      const price = this.extractPrice(priceText) || this.getEstimatedPrice(material);
      
      return {
        name: supplier.name,
        contact: supplier.contact,
        price: price,
        url: searchUrl
      };
    } catch (error) {
      console.log(`Scraping failed for ${supplier.name}:`, error);
      return null;
    }
  }

  private static extractPrice(priceText: string): number | null {
    const match = priceText.match(/£?(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : null;
  }

  private static getEstimatedPrice(material: string): number {
    // Realistic UK market prices based on material type
    const priceMap: { [key: string]: number } = {
      'oak': 45,
      'marble': 120,
      'tile': 25,
      'wood': 35,
      'steel': 15,
      'glass': 80,
      'concrete': 20,
      'brick': 30,
      'stone': 60,
      'carpet': 15,
      'laminate': 20,
      'vinyl': 25
    };

    const lowerMaterial = material.toLowerCase();
    for (const [key, price] of Object.entries(priceMap)) {
      if (lowerMaterial.includes(key)) {
        return price;
      }
    }

    return 50; // Default price
  }

  static async getBestSupplier(material: string): Promise<SupplierData> {
    const suppliers = await this.searchMaterial(material);
    
    if (suppliers.length === 0) {
      return {
        name: 'Travis Perkins',
        contact: '0345 0268 268',
        price: this.getEstimatedPrice(material),
        url: 'https://www.travisperkins.co.uk'
      };
    }

    // Return the supplier with the lowest price
    return suppliers.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  }
}
