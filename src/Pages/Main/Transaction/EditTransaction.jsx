import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  GiftIcon,
  TrophyIcon,
  ArrowLeftIcon,
  TriangleAlertIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import axios from "axios";
import api from "@/Utils/api";

const EditTransaction = ({ transaction, onBack, onSuccess, balance }) => {
  const [type, setType] = useState(transaction?.type || "income");
  const [note, setNote] = useState(transaction?.note || "");
  const [amount, setAmount] = useState(transaction?.amount ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category || "salary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBalanceError, setShowBalanceError] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setNote(transaction.note || "");
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
    }
  }, [transaction]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Miqdor musbat bo‘lishi kerak.");
      return;
    }

    const amountValue = parseFloat(amount);
    if (type === "expense" && (balance === 0 || amountValue > balance)) {
      setShowBalanceError(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${api}/api/action/${transaction.id}`,
        {
          type,
          note,
          amount: amountValue,
          category
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("actions");
      localStorage.removeItem("actions_Bu oy");
      localStorage.removeItem("actions_Bugun");
      localStorage.removeItem("actions_Bu hafta");
      localStorage.removeItem("actions_Bu yil");
      localStorage.removeItem("actions_Umumiy");
      await onSuccess();
      onBack();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError("Tranzaksiya yangilashda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full mr-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Tranzaksiyani tahrirlash</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        {/* Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg overflow-hidden mb-6">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all duration-200",
              type === "income"
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setType("income")}
          >
            Kirim
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all duration-200",
              type === "expense"
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setType("expense")}
          >
            Chiqim
          </button>
        </div>

        {/* Note Input */}
        <div className="mb-4">
          <Input
            placeholder="Izoh"
            className="w-full p-3 border rounded-lg shadow-sm text-gray-700"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Miqdori"
            type="number"
            className="flex-1 p-3 border rounded-lg shadow-sm text-gray-700"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3 mb-3">
        <CategoryButton
            label="Maosh"
            icon={<BriefcaseIcon className="w-5 h-5 text-blue-500" />}
            isActive={category === "salary"}
            onClick={() => setCategory("salary")}
          />
          <CategoryButton
            label="Hadiya"
            icon={<GiftIcon className="w-5 h-5 text-gray-500" />}
            isActive={category === "gift"}
            onClick={() => setCategory("gift")}
          />
          <CategoryButton
            label="Mukofot"
            icon={<TrophyIcon className="w-5 h-5 text-gray-500" />}
            isActive={category === "award"}
            onClick={() => setCategory("award")}
          />
          <CategoryButton
            label="Xarid"
            icon={<ShoppingCartIcon className="w-5 h-5 text-gray-500" />}
            isActive={category === "shopping"}
            onClick={() => setCategory("shopping")}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <CategoryButton
            label="Boshqalar"
            icon={<TriangleAlertIcon className="w-5 h-5 text-gray-500" />}
            isActive={category === "other"}
            onClick={() => setCategory("other")}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 border-t mt-auto">
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
            onClick={onBack}
          >
            Bekor qilish
          </Button>
          <Button
            className={cn(
              "flex-1 py-3 text-white shadow-md transition-colors",
              type === "income" ? "bg-green-500 hover:bg-green-600" : "bg-green-500 hover:bg-green-600"
            )}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Yuklanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}

      {/* Balance Error Modal */}
      <Dialog open={showBalanceError} onOpenChange={setShowBalanceError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Balans yetarli emas</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {balance === 0
              ? "Sizning balansingiz nol. Chiqim tranzaksiyasini amalga oshirish mumkin emas."
              : `Siz kiritmoqchi bo'lgan chiqim (${amount} So'm) joriy balansingizdan (${balance} So'm) oshib ketmoqda.`}
          </p>
          <DialogFooter className="mt-4">
            <Button variant="default" onClick={() => setShowBalanceError(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CategoryButton = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200",
      isActive
        ? "bg-blue-50 border border-blue-500 shadow-sm"
        : "bg-white border border-gray-200 hover:border-gray-300"
    )}
  >
    <div
      className={cn("p-1 rounded mb-1", isActive ? "bg-blue-100" : "bg-gray-100")}
    >
      {icon}
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </button>
);

export default EditTransaction;