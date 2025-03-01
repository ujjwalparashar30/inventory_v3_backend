import puppeteer from "puppeteer";
import { Schema } from "mongoose";

export interface Item {
  _id: Schema.Types.ObjectId;
  ean?: string;
  title: string;
  upc?: string;
  gtin?: string;
  asin?: string;
  description?: string;
  brand?: string;
  model?: string;
  dimension?: string;
  weight?: string;
  category?: string;
  currency?: string;
  lowest_recorded_price?: number;
  highest_recorded_price?: number;
  images?: string[]; // Array of strings for image URLs
  elid?: string;
}

export async function scrapeUPCData(upcCode: string): Promise<Partial<Item> | null> {
  const url = `https://go-upc.com/search?q=${upcCode}`;

  // Set timeout (10 seconds)
  const TIMEOUT = 10000;

  // Puppeteer launch configuration
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || puppeteer.executablePath(), // Use Render's Chromium binary or fallback to local
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Helps avoid memory issues in cloud environments
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--single-process", // May be necessary for resource-constrained environments
    ],
  }).catch((err) => {
    console.error("Failed to launch browser:", err);
    return null;
  });

  if (!browser) return null;
  const page = await browser.newPage();

  try {
    // Create a timeout function
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.error(`Timeout: Data not found for UPC ${upcCode} within ${TIMEOUT / 1000} seconds.`);
        resolve(null);
      }, TIMEOUT);
    });

    // Start page navigation and scraping
    const scrapingPromise = (async () => {
      await page.goto(url, { waitUntil: "domcontentloaded" }).catch((err) => {
        console.error("Failed to navigate to the URL:", err);
        browser.close();
        return null;
      });

      await page.waitForSelector(".product-name, .no-results", { timeout: 5000 }).catch((err) => {
        console.error("Failed to find product details or no results message:", err);
        browser.close();
        return null;
      });

      const noResults = await page.evaluate(() => {
        return document.querySelector(".no-results") !== null;
      });

      if (noResults) {
        console.log(`UPC code ${upcCode} not found.`);
        await browser.close();
        return null;
      }

      const scrapedData: Partial<Item> = await page.evaluate(() => {
        const productName = document.querySelector(".product-name")?.textContent?.trim() || null;
        const rows = document.querySelectorAll("table.table-striped tr");

        const getRowValue = (label: string): string | null => {
          return (
            Array.from(rows)
              .find((row) => row.querySelector("td")?.textContent?.trim() === label)
              ?.querySelector("td + td")
              ?.textContent?.trim() || null
          );
        };

        const ean = getRowValue("EAN") || undefined;
        const brand = getRowValue("Brand") || undefined;
        const category = getRowValue("Category") || undefined;
        const imageUrl = document
          .querySelector("figure.product-image.non-mobile img")
          ?.getAttribute("src")
          ?.trim() || null;

        return {
          title: productName || "Unknown Product",
          ean,
          upc: ean, // Assuming UPC might be the same as EAN if not available separately
          brand,
          category,
          images: imageUrl ? [imageUrl] : [],
        };
      });

      await browser.close();
      return scrapedData;
    })();

    // Return the first completed promise (either timeout or scraping)
    return await Promise.race([scrapingPromise, timeoutPromise]);
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    await browser.close();
    return null;
  }
}