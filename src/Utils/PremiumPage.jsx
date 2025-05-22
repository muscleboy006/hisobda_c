import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Star, Crown, Zap, Shield, Calendar, Sparkles } from 'lucide-react';

const PremiumPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('1month');

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
      originalPrice: null,
      popular: false,
      savings: null,
      pricePerMonth: '36 000',
      badge: null
    },
    {
      id: '2months',
      duration: '2 oy',
      price: '55 000',
      originalPrice: '72 000',
      popular: true,
      savings: '17 000',
      pricePerMonth: '27 500',
      badge: 'MASHHUR'  
    },
    {
      id: '3months',
      duration: '3 oy',
      price: '80 000',
      originalPrice: '108 000',
      popular: false,
      savings: '28 000',
      pricePerMonth: '26 667',
      badge: 'ENG TEJAMKOR'
    }
  ];

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      title: "Cheksiz foydalanish",
      description: "Barcha funksiyalardan cheklovsiz foydalaning"
    },
    {
      icon: <Crown className="w-5 h-5 text-purple-500" />,
      title: "Premium funksiyalar",
      description: "Faqat premium foydalanuvchilar uchun maxsus imkoniyatlar"
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      title: "24/7 Qo'llab-quvvatlash",
      description: "Har qanday savol yoki muammoda yordam"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pink-500" />,
      title: "Reklama yo'q",
      description: "Hech qanday reklama va bezovtalik yo'q"
    },
    {
      icon: <Star className="w-5 h-5 text-blue-500" />,
      title: "Prioritet xizmat",
      description: "Tezkor javob va birinchi navbatda xizmat ko'rsatish"
    },
    {
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      title: "Darhol faollashtirish",
      description: "To'lov qilgandan so'ng darhol foydalaning"
    }
  ];

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 lg:h-10 lg:w-10"
          >
            <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
          <h1 className="text-lg lg:text-xl font-semibold">Premium Obuna</h1>
          <div className="w-8 lg:w-10" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column - Hero & Features */}
          <div className="space-y-6 lg:space-y-8">
            {/* Hero Section */}
            <div className="text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Crown className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
                Premium Rejaga O'ting
              </h2>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                Barcha imkoniyatlardan to'liq foydalaning va ishingizni yanada samarali qiling. 
                Bizning xizmatdan foydalanish uchun obuna talab qilinadi.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs lg:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Benefits */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl font-semibold text-green-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 lg:w-6 lg:h-6" />
                  Nima Uchun Bizni Tanlash Kerak?
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {[
                  "Tezkor va ishonchli xizmat",
                  "Muntazam yangilanishlar",
                  "Maxfiylik himoyasi",
                  "Oson foydalanish"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm lg:text-base text-gray-700">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-4">
              <h3 className="text-xl lg:text-2xl font-bold text-center text-gray-900">
                Tarifni Tanlang
              </h3>
              
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${
                        plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'
                      }`}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedPlan === plan.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-lg lg:text-xl font-bold text-gray-900">
                            {plan.duration}
                          </h4>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl lg:text-3xl font-bold text-blue-700">
                              {plan.price}
                            </span>
                            <span className="text-sm lg:text-base text-gray-600">so'm</span>
                            {plan.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {plan.originalPrice} so'm
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs lg:text-sm text-gray-600">
                            Oylik: {Math.round(parseInt(plan.pricePerMonth)).toLocaleString()} so'm
                          </div>
                          
                          {plan.savings && (
                            <div className="text-xs lg:text-sm text-green-600 font-medium">
                              ✨ {plan.savings} so'm tejash
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 lg:p-8">
                <div className="text-center space-y-4">
                  <div>
                    <h4 className="text-lg lg:text-xl font-bold text-blue-800 mb-2">
                      Tanlangan tarif: {selectedPlanData?.duration}
                    </h4>
                    <div className="text-2xl lg:text-3xl font-bold text-blue-700">
                      {selectedPlanData?.price} so'm
                    </div>
                    {selectedPlanData?.savings && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {selectedPlanData.savings} so'm tejaysiz!
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(selectedPlanData?.duration, selectedPlanData?.price)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 lg:py-6 h-auto text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    💳 Hoziroq Sotib Olish
                  </Button>
                  
                  <p className="text-xs lg:text-sm text-gray-500">
                    Xavfsiz to'lov • Darhol faollashtirish
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl font-semibold">
                  Tez-tez So'raladigan Savollar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm lg:text-base text-gray-900 mb-2">
                    Qanday to'lov qilsam bo'ladi?
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600">
                    Telegram orqali bog'laning, biz sizga barcha to'lov usullarini ko'rsatamiz (Click, Payme, bank o'tkazmasi).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm lg:text-base text-gray-900 mb-2">
                    Obuna qachon faollashadi?
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600">
                    To'lov tasdiqlanishi bilan darhol obunangiz faollashadi va foydalanishni boshlaysiz.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm lg:text-base text-gray-900 mb-2">
                    Yordam kerak bo'lsa?
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600">
                    24/7 Telegram orqali bog'lanishingiz mumkin: @hisobda_app
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;