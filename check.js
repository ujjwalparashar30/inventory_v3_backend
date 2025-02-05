// const puppeteer = require('puppeteer');

// async function scrapeUPCData(upcCode) {
//     const url = `https://go-upc.com/search?q=${upcCode}`;
//     const browser = await puppeteer.launch({ headless: true }); // Headless mode (no GUI)
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'domcontentloaded' });

//     // Wait for the product details to load
//     await page.waitForSelector('.product-name'); // Adjust selector if necessary

//     // Extract the product name, brand, and other details
//     const productDetails = await page.evaluate(() => {
//         const productName = document.querySelector('.product-name')?.textContent?.trim();
        
//         // Find the table rows containing metadata
//         const rows = document.querySelectorAll('table.table-striped tr');
    
//         // Extract the EAN, brand, and category based on their labels
//         const ean = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'EAN')?.querySelector('td + td')?.textContent?.trim();
//         const brand = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Brand')?.querySelector('td + td')?.textContent?.trim();
//         const category = Array.from(rows).find(row => row.querySelector('td')?.textContent?.trim() === 'Category')?.querySelector('td + td')?.textContent?.trim();
        
//         // Get the image URL from the <figure> element with class 'product-image non-mobile'
//         const imageUrl = document.querySelector('figure.product-image.non-mobile img')?.getAttribute('src')?.trim();
    
//         // Return the extracted details
//         return {
//             productName,
//             ean,
//             brand,
//             category,
//             imageUrl,
//         };
//     });
    
//     console.log(productDetails);

//     await browser.close();
// }

// // Call the function with a sample UPC code
// scrapeUPCData('3426');

const puppeteer = require('puppeteer');

async function scrapeUPCData(upcCode) {
    const url = `https://go-upc.com/search?q=${upcCode}`;
    const browser = await puppeteer.launch({ headless: true }).catch((err) => {
        console.error("Failed to launch browser:", err);
        process.exit(1);
    });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(async(err) => {
            console.error("Failed to navigate to the URL:", err);
            await browser.close();
            return;
        });

        // Wait for the product details to load or for a message indicating no results
        await page.waitForSelector('.product-name, .no-results', { timeout: 5000 }).catch(async(err) => {
            console.error("Failed to find product details or no results message:", err);
            await browser.close();
            return;
        });

        // Check if the "no results" message is present
        const noResults = await page.evaluate(() => {
            return document.querySelector('.no-results') !== null;
        });

        if (noResults) {
            console.log(`UPC code ${upcCode} not found.`);
            await browser.close();
            return;
        }

        // Extract the product name, brand, and other details
        const productDetails = await page.evaluate(() => {
            const productName = document.querySelector('.product-name')?.textContent?.trim() || null;

            // Find the table rows containing metadata
            const rows = document.querySelectorAll('table.table-striped tr');

            // Extract the EAN, brand, and category based on their labels
            const ean =
                Array.from(rows).find((row) => row.querySelector('td')?.textContent?.trim() === 'EAN')?.querySelector('td + td')?.textContent?.trim() || null;
            const brand =
                Array.from(rows).find((row) => row.querySelector('td')?.textContent?.trim() === 'Brand')?.querySelector('td + td')?.textContent?.trim() || null;
            const category =
                Array.from(rows).find((row) => row.querySelector('td')?.textContent?.trim() === 'Category')?.querySelector('td + td')?.textContent?.trim() || null;

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
    } catch (error) {
        console.error("An error occurred during scraping:", error);
    } finally {
        await browser.close();
    }
}

// Call the function with a sample UPC code
console.log("Starting scraping...");
scrapeUPCData('8908010238289')
    .then(() => console.log("Scraping completed."))
    .catch((err) => console.error("Error during scraping:", err));