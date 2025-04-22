import { useEffect, useState } from 'react';

export default function Budibase() {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if Budibase script already exists
        const existingScript = document.getElementById('budibase-embed-script');
        
        if (!existingScript) {
            // Create script element
            const script = document.createElement('script');
            script.id = 'budibase-embed-script';
            script.src = 'https://traderjo.budibase.app/embed/budibase-embed.js';
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            
            // Append to document
            document.body.appendChild(script);
            
            // Clean up
            return () => {
                document.body.removeChild(script);
            };
        } else {
            setScriptLoaded(true);
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Manage Users</h1>
            <iframe 
                width="800" 
                height="600" 
                frameBorder="0" 
                allow="clipboard-write;camera;geolocation;fullscreen" 
                src="https://traderjo.budibase.app/embed/profiles"
            ></iframe>
        </div>
    );
}