import  {ChangeEvent, useCallback, useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Tesseract from "tesseract.js";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from '@ant-design/icons';

function App() {
    const [selectedImage, setSelectedImage] = useState<File|null>(null)
    const [text, setText] = useState<string>('');

    const extractTextFromImage = useCallback(async (image: File) => {
        try {
            const result = await Tesseract.recognize(image, 'eng', {
                logger: (m) => console.log(m), // Log progress
            });
            console.log('Recognized Text:', result.data.text);
            setText(result.data.text);
            //console.log(getCommand(result.data.text));
            await copyToClipboard(getCommand(result.data.text))
        } catch (error) {
            console.error('Error recognizing image:', error);
        }
    }, []);

    useEffect(() => {
        const handlePaste = async (event: ClipboardEvent) => {
            console.log("PASTE")
            const items = event.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.kind === 'file') {
                        const file = item.getAsFile();
                        if (file) {
                            setSelectedImage(file);
                            await extractTextFromImage(file);
                        }
                    }
                }
            }
        };

        // const handleKeyDown = (event: KeyboardEvent) => {
        //     console.log("X")
        //     if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        //         console.log("XXX")
        //         // Prevent default paste behavior to handle it manually
        //         //event.preventDefault();
        //     }
        // };

        //window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePaste);

        // Clean up event listeners on component unmount
        return () => {
            //window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePaste);
        };
    }, [extractTextFromImage]);

    // const handlePaste2 = useCallback(async (event: ClipboardEvent) => {
    //     const items = event.clipboardData?.items;
    //     if (items) {
    //         for (const item of items) {
    //             if (item.kind === 'file') {
    //                 const file = item.getAsFile();
    //                 if (file) {
    //                     setSelectedImage(file);
    //                     await extractTextFromImage(file);
    //                 }
    //             }
    //         }
    //     }
    // }, []);

    // const handlePaste = async (event: ClipboardEvent) => {
    //     const items = event.clipboardData?.items;
    //     if (items) {
    //         for (const item of items) {
    //             if (item.kind === 'file') {
    //                 const file = item.getAsFile();
    //                 if (file) {
    //                     setSelectedImage(file);
    //                     await extractTextFromImage(file);
    //                 }
    //             }
    //         }
    //     }
    // };

    async function handleChangeImage(e:ChangeEvent<HTMLInputElement>) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setSelectedImage(file);
            await extractTextFromImage(file);
        }
    }

    // const extractTextFromImage = async (image: File) => {
    //     try {
    //         const result = await Tesseract.recognize(image, 'eng', {
    //             logger: (m) => console.log(m), // Log progress
    //         });
    //         console.log('Recognized Text:', result.data.text);
    //         setText(result.data.text);
    //         //console.log(getCommand(result.data.text));
    //         await copyToClipboard(getCommand(result.data.text))
    //     } catch (error) {
    //         console.error('Error recognizing image:', error);
    //     }
    // };


    function getCommand(extractedText: string) {
        // Regular expressions to extract the fields
        const addressMatch = extractedText.match(/^(.*?)\s*Owner:/);  // Capture from start until "Owner:"
        const ownerMatch = extractedText.match(/Owner:\s*(.*?)(?=\s*Description:)/);
        const shellMatch = extractedText.match(/Shell:\s*(.*?)(?=\s*For Sale:)/);  // Now constrained between "Shell:" and "For Sale:"

        // Extracted values
        const address = addressMatch ? addressMatch[1] : '';
        const owner = ownerMatch ? ownerMatch[1] : '';
        const shell = shellMatch ? shellMatch[1] : '';

        // Create the string
        const result = `/house-receipt realestate-name:James Win customer-name:${owner} street:${address} sheel:${shell}`;

        return result;
    }

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }


  return (
    <>
      <div>
          <a href="https://vitejs.dev" target="_blank">
              {/*<img src={viteLogo} className="logo" alt="Vite logo"/>*/}
              <img src={"https://dunb17ur4ymx4.cloudfront.net/webstore/logos/62c93cceaf438bf405a88e9eef4eaf0f7f22ba3b.png"} className="logo" alt="Vite logo"/>
          </a>
        {/*  <a href="https://react.dev" target="_blank">*/}
        {/*  <img src={reactLogo} className="logo react" alt="React logo" />*/}
        {/*</a>*/}
      </div>
      <h1>PRRP Business receipts creator</h1>
        <input type={"file"} onChange={handleChangeImage} accept="image/*" />
        {selectedImage && (
            <div style={{ marginTop: '20px' }}>
                <p>Selected Image:</p>
                <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    style={{ maxWidth: '400px', maxHeight: '400px' }}
                />
            </div>
        )}
        {text && (
            <div style={{ marginTop: '20px' }}>
                <h2>Extracted Text:</h2>
                <p>{text}</p>
            </div>
        )}



      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
