const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Screenshot endpoint
app.post("/capture", async (req, res) => {
    try {
        const { html, css, width, height } = req.body;

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // Set viewport size based on the infographic dimensions
        await page.setViewport({
            width: Math.min(width, 1920),
            height: Math.min(height + 100, 1080),
            deviceScaleFactor: 2,
        });

        // Create a complete HTML document with the infographic content
        const fullHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>${css}</style>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            display: flex; 
                            justify-content: center; 
                            background-color: #f8fafc;
                        }
                        .infographic-container { 
                            width: ${width}px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="infographic-container">
                        ${html}
                    </div>
                </body>
            </html>
        `;

        // Set the content and wait for rendering
        await page.setContent(fullHtml, {
            waitUntil: "networkidle0",
        });

        // Wait a bit more to ensure all rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Take screenshot
        const screenshot = await page.screenshot({
            type: "png",
            fullPage: true,
            omitBackground: true,
        });

        // Close browser
        await browser.close();

        // Send the screenshot
        res.set("Content-Type", "image/png");
        res.send(screenshot);
    } catch (error) {
        console.error("Error capturing screenshot:", error);
        res.status(500).send("Error capturing screenshot");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
