import { CheckoutUI } from "@/components/settings/checkout-ui";

export default function CheckoutPage({ searchParams }: { searchParams: { plan?: string, price?: string } }) {
  const plan = searchParams.plan || "Master Grower";
  const price = searchParams.price || "$24.99";

  return (
    <div className="min-h-screen bg-brand-cream py-20">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-black text-brand-dark tracking-tight italic">Finalize Your <span className="text-brand-pink italic">Botanical Future</span></h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Step 2 of 2: Secure Checkout</p>
        </header>
        <CheckoutUI planName={plan} price={price} />
      </div>
    </div>
  );
}
