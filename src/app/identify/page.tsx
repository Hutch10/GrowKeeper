import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { PlantIdentifier } from '@/components/plants/plant-identifier';

export default async function IdentifyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Plant Identification
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Use AI to identify any plant and get detailed care instructions
      </p>
      
      <PlantIdentifier />
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          💡 Tips for better results
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Take a clear, well-lit photo of the plant</li>
          <li>• Include leaves, flowers, or distinctive features</li>
          <li>• Avoid blurry or dark images</li>
          <li>• Focus on a single plant at a time</li>
        </ul>
      </div>
    </div>
  );
}
