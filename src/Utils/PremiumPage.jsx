import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPage = () => {
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1)
    console.log('Навигация назад');
  };
  const [selectedPlan, setSelectedPlan] = useState('2months');

  const handlePurchase = (planType, price) => {
    const message = `Assalomu alaikum! Men ${planType} lik tarifni sotib olmoqchiman. Narxi: ${price} so'm`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/hisobda_app?text=${encodedMessage}`, '_blank');
  };

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

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Premium</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Obuna
          </h2>
          <p className="text-gray-600">
            Barcha funksiyalardan cheklovsiz foydalaning
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
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
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Tanlangan:</div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedPlanData?.price} so'm
              </div>
            </div>
            
            <Button
              onClick={() => handlePurchase(selectedPlanData?.duration, selectedPlanData?.price)}
              className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-base font-medium"
            >
              Sotib Olish
            </Button>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center text-sm text-gray-500">
          Yordam: @hisobda_app
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;