import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PremiumModal({ open, onClose }) {
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
          Chatdan cheklovlarsiz foydalanish uchun quyidagi tariflardan birini tanlang:
        </div>

        <div className="grid gap-3 mt-6">
          <Button
            onClick={() => handlePurchase("2 hafta", "59 000")}
            className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-base py-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all"
          >
            🕑 2 hafta – 59 000 so'm
          </Button>

          <Button
            onClick={() => handlePurchase("1 oy", "79 000")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base py-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all"
          >
            📅 1 oy – 79 000 so'm
          </Button>

          <Button
            variant="ghost"
            className="mt-2 text-sm text-gray-500"
            onClick={onClose}
          >
            Bekor qilish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}