import { Monitor, Smartphone } from 'lucide-react';

const MobileWarning = () => {
  return (
    <div className="min-h-screen bg-muted-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Monitor className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-muted-900 mb-4">
          Desktop Only App
        </h1>

        <p className="text-muted-600 mb-6 leading-relaxed">
          This tiled background generator is optimized for desktop use and requires a larger screen to provide the best experience for creating and previewing your designs.
        </p>

        <div className="flex items-center justify-center text-muted-500 text-sm">
          <Smartphone className="w-4 h-4 mr-2" />
          Please access this app from a desktop or tablet device
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;