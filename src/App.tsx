import  {ChangeEvent, useCallback, useEffect, useState} from 'react'
import './App.css'
import {Utils} from "./utils/Utils.ts";
import {Input, notification} from "antd";
import {useLocalStorageState} from "./hooks/useLocalStorageState.ts";

function App() {
    const [realEstateName, setRealEstateName] = useLocalStorageState("realEstateName","");
    const [selectedImage, setSelectedImage] = useState<File|null>(null)
    const [text, setText] = useState<string>('');
    const [api, contextHolder] = notification.useNotification();

    const openNotification = useCallback(async (pauseOnHover: boolean) => {
        api.open({
            message: 'Hooray!!!',
            description:
                'Command copied successfully to your clipboard!.',
            showProgress: true,
            pauseOnHover,
        });
    }, [api]);

    const extractTextFromImage = useCallback(async (image: File) => {
        const text = await Utils.extractTextFromImage(image);
        if(text){
            setText(text);
            await Utils.copyToClipboard(getCommand(text))
            await openNotification(true)
        }
    }, [openNotification]);

    useEffect(() => {
        const handlePaste = async (event: ClipboardEvent) => {
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

        window.addEventListener('paste', handlePaste);

        // Clean up event listeners on component unmount
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [extractTextFromImage]);

    async function handleChangeImage(e:ChangeEvent<HTMLInputElement>) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setSelectedImage(file);
            await extractTextFromImage(file);
        }
    }
    
    function getCommand(extractedText: string) {
        // Regular expressions to extract the fields
        const addressMatch = extractedText.match(/^(.*?)\s*Owner:/);  // Capture from start until "Owner:"
        const ownerMatch = extractedText.match(/Owner:\s*(.*?)(?=\s*(?:Description:|Descrition:))/);
        const shellMatch = extractedText.match(/Shel{1,2}:\s*(.*?)(?=\s*For\s*Sale:|\s*ForSale:)/);

        // Extracted values
        const address = addressMatch ? addressMatch[1] : '';
        const owner = ownerMatch ? ownerMatch[1] : '';

        // Check for shell match and remove any dots
        let shell = '';
        if (shellMatch && shellMatch[1]) {
            shell = shellMatch[1].replace(/\./g, '');  // Remove dots from the matched shell value
        }

        // Create the string
        const result = `/house-receipt realestate-name:${realEstateName} customer-name:${owner} street:${address} sheel:${shell}`;

        return result;
    }



    return (
      <>
          {contextHolder}
          <h1>PRRP Business receipts creators</h1>
          <Input placeholder="Real estate name" value={realEstateName} onChange={(e) => setRealEstateName(e.target.value)} />
          <input type={"file"} onChange={handleChangeImage} accept="image/*"/>

          {selectedImage && (
              <div style={{marginTop: '20px'}}>
                  <p>Selected Image:</p>
                  <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected"
                      style={{maxWidth: '400px', maxHeight: '400px'}}
                  />
              </div>
          )}
          {text && (
              <div style={{marginTop: '20px'}}>
                  <h2>Extracted Text:</h2>
                  <p>{text}</p>
              </div>
          )}
      </>
  )
}

export default App
