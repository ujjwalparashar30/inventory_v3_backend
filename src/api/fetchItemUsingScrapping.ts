import puppeteer from 'puppeteer';

interface ProductDetails {
    productName: string | undefined;
    ean: string | null;
    brand: string | null;
    category: string | null;
    imageUrl: string | null;
}

export default async function scrapeUPCData(upcCode: string): Promise<void> {
    const url = `https://go-upc.com/search?q=${upcCode}`;
    const browser = await puppeteer.launch({ headless: true }); // Headless mode (no GUI)
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the product details to load
    await page.waitForSelector('.product-name'); // Adjust selector if necessary

    // Extract the product name, brand, and other details
    const productDetails: ProductDetails = await page.evaluate(() => {
        const productName = document.querySelector('.product-name')?.textContent?.trim();
        
        // Find the table rows containing metadata
        const rows = document.querySelectorAll('table.table-striped tr');
    
        // Extract the EAN, brand, and category based on their labels
        const ean = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'EAN')?.querySelector('td + td')?.textContent?.trim() || null;
        const brand = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Brand')?.querySelector('td + td')?.textContent?.trim() || null;
        const category = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Category')?.querySelector('td + td')?.textContent?.trim() || null;
        
        // Get the image URL from the <figure> element with class 'product-image non-mobile'
        const imageUrl = document.querySelector('figure.product-image.non-mobile img')?.getAttribute('src')?.trim() || null;
    
        // Return the extracted details
        return {
            productName,
            ean,
            brand,
            category,
            imageUrl,
        };
    });
    
    console.log(productDetails);

    await browser.close();
}

// Call the function with a sample UPC code
scrapeUPCData('8908010238289');
