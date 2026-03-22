import { getSwapListings } from "@/app/actions/community";
import { SwapBoard } from "@/components/community/swap-board";

export default async function SwapPage() {
  const result = await getSwapListings();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400 font-bold">Failed to load swap listings.</p>
      </div>
    );
  }

  return <SwapBoard listings={result.data} />;
}
