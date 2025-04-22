export default function Budibase() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Manage Users</h1>
            <div className="w-full max-w-4xl h-[600px] border border-gray-300 rounded">
                <iframe 
                    title="Budibase Profiles"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allow="clipboard-write;camera;geolocation;fullscreen" 
                    src="https://traderjo.budibase.app/embed/profiles"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                ></iframe>
            </div>
        </div>
    );
}
