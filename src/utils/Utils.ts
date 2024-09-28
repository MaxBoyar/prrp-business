import * as Tesseract from "tesseract.js";

export class Utils {
    static async extractTextFromImage(image: File): Promise<string | undefined> {
        let text = undefined;

        try {
            const result = await Tesseract.recognize(image, 'eng', {
                logger: (m) => console.log(m), // Log progress
            });
            text = result.data.text
        } catch (error) {
            console.error('Error recognizing image:', error);
        }

        return text;
    }

    static async copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
}