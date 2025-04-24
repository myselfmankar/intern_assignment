document
    .getElementById("screenshot-btn")
    .addEventListener("click", async function () {
        const infographic = document.getElementById("infographic");
        const button = this;

        // Show loading state
        button.disabled = true;
        button.textContent = "Capturing...";

        try {
            // Get the HTML content of the infographic
            const htmlContent = infographic.innerHTML;
            const styles = Array.from(document.styleSheets)
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join("\n");
                    } catch (e) {
                        return "";
                    }
                })
                .join("\n");

            // Send to backend for screenshot
            const response = await fetch("http://localhost:3000/capture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    html: htmlContent,
                    css: styles,
                    width: infographic.offsetWidth,
                    height: infographic.offsetHeight,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to capture screenshot");
            }

            // Get the image blob
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement("a");
            a.href = url;
            a.download = "future-of-work-infographic.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Revoke the blob URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error("Error capturing screenshot:", error);
            alert("Failed to capture screenshot. Please try again.");
        } finally {
            // Reset button
            button.disabled = false;
            button.textContent = "Take Screenshot";
        }
    });
