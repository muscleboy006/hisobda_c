import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PremiumModal({ open, onClose }) {
  const plans = [
    {
      id: '1month',
      duration: '1 oy',
      price: '36 000',
      pricePerMonth: '36 000'
    },
    {
      id: '2months',
      duration: '2 oy',
      price: '55 000',
      originalPrice: '72 000',
      pricePerMonth: '27 500',
      popular: true
    },
    {
      id: '3months',
      duration: '3 oy',
      price: '80 000',
      originalPrice: '108 000',
      pricePerMonth: '26 667'
    }
  ];

  const handlePurchase = (planType, price) => {
    const message = `Assalomu alaikum! Men Nikoh.uz ilovasi uchun ${planType} lik tarifni sotib olmoqchiman. Narxi: ${price} so'm`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/hisobda_app?text=${encodedMessage}`, '_blank');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">🔐 Premium kerak</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mt-2">
          Ilovadan cheklovlarsiz foydalanish uchun quyidagi tariflardan birini tanlang:
        </div>

        <div className="space-y-3 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handlePurchase(plan.duration, plan.price)}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  ORTACHA
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.duration}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-blue-600">
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-500">so'm</span>
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(parseInt(plan.pricePerMonth)).toLocaleString()} so'm/oy
                  </div>
                </div>
                <div className="text-2xl">
                  {plan.id === '1month' && '⚡'}
                  {plan.id === '2months' && '🔥'}
                  {plan.id === '3months' && '💎'}
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            Bekor qilish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}