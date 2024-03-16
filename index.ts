import express, { type Request, type Response } from 'express';
import puppeteer from 'puppeteer';

const app = express();
const port = process.env.PORT || '8000';

app.use(express.json());

async function takeScreenshot(url: string, viewport?: { width: number, height: number, isMobile?: boolean }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });

    if (viewport) {
      await page.setViewport(viewport);
    }

    return await page.screenshot({ fullPage: true });
  } catch (error) {
    console.error('Error occurred while taking screenshot:', error);
    return null;
  } finally {
    await browser.close();
  }
}

app.post('/screenshot', async (req: Request, res: Response) => {
  const { url, viewport } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const screenshot = await takeScreenshot(url, viewport);
    if (!screenshot) {
      return res.status(500).json({ error: 'Failed to capture screenshot' });
    }

    res.set({ 'Content-Type': 'image/png' }).send(screenshot);
  } catch (error) {
    console.error('Error occurred while processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
