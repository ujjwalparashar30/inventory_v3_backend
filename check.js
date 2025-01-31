const puppeteer = require('puppeteer');

async function scrapeUPCData(upcCode) {
    const url = `https://go-upc.com/search?q=${upcCode}`;
    const browser = await puppeteer.launch({ headless: true }); // Headless mode (no GUI)
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the product details to load
    await page.waitForSelector('.product-name'); // Adjust selector if necessary

    // Extract the product name, brand, and other details
    const productDetails = await page.evaluate(() => {
        const productName = document.querySelector('.product-name')?.textContent?.trim();
        
        // Find the table rows containing metadata
        const rows = document.querySelectorAll('table.table-striped tr');
    
        // Extract the EAN, brand, and category based on their labels
        const ean = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'EAN')?.querySelector('td + td')?.textContent?.trim();
        const brand = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Brand')?.querySelector('td + td')?.textContent?.trim();
        const category = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Category')?.querySelector('td + td')?.textContent?.trim();
        
        // Get the image URL from the <figure> element with class 'product-image non-mobile'
        const imageUrl = document.querySelector('figure.product-image.non-mobile img')?.getAttribute('src')?.trim();
    
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
scrapeUPCData('3426');
