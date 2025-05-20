import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, Users, Loader2Icon } from 'lucide-react';
import api from '@/Utils/api';

export const UZBEK_CATEGORY_NAMES = {
  shopping: 'Xaridlar',
  salary: 'Maosh',
  gift: 'Sovgʻa',
  award: 'Mukofot',
  other: 'Boshqa',
  default: 'Kategoriyasiz'
};

export default function StatisticsDashboard() {
  const [stats, setStats] = useState({
    topIncomes: [],
    topExpenses: [],
    topDebts: [],
    topDebtors: [],
    summary: {
      income: "0",
      expense: "0",
      balance: "0",
      givenDebts: "0",
      takenDebts: "0",
      netDebts: "0"
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('Bu oy');
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#a78bfa', '#fbbf24', '#ec4899', '#8b5cf6', '#6366f1'];

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  // const fetchStatistics = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(`${api}/tg/stats?period=${period}`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     if (!response.ok) {
  //       throw new Error('Server responded with an error');
  //     }
  //     const data = await response.json();
  //     console.log('====================================');
  //     console.log(data);
  //     console.log('====================================');
  //     setStats(data);
  //     console.log(data);
  //   } catch (err) {
  //     console.error('Error fetching statistics:', err);
  //     setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${api}/tg/stats?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Server responded with an error');
  
      const data = await response.json();
      const parsedData = parseMongoDecimal(data);
      setStats(parsedData);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };
  
  function parseMongoDecimal(obj) {
    if (obj && typeof obj === 'object') {
      if ('$numberDecimal' in obj) {
        return Number(obj.$numberDecimal);
      }
      for (const key in obj) {
        obj[key] = parseMongoDecimal(obj[key]);
      }
    }
    return obj;
  }
  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount)) + ' so\'m';
  };

  // Helper function to extract actual amount from MongoDB decimal
  const getAmount = (item) => {
    if (item && item.amount) {
      if (item.amount.$numberDecimal) {
        return Number(item.amount.$numberDecimal);
      }
      return Number(item.amount);
    }
    return 0;
  };

  // Helper function to get Uzbek category name
  const getUzbekCategoryName = (category) => {
    return UZBEK_CATEGORY_NAMES[category] || UZBEK_CATEGORY_NAMES.default;
  };

  // Format the data for charts
  const prepareIncomesChart = () => {
    return stats.topIncomes.map((item, index) => ({
      name: getUzbekCategoryName(item.category),
      amount: getAmount(item),
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareExpensesChart = () => {
    return stats.topExpenses.map((item, index) => ({
      name: getUzbekCategoryName(item.category),
      amount: getAmount(item),
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareSummaryPieData = () => {
    return [
      { name: "Daromad", value: Number(stats.summary.income), color: "#4ade80" },
      { name: "Xarajat", value: Number(stats.summary.expense), color: "#f87171" }
    ];
  };

  const prepareDebtsPieData = () => {
    const givenDebts = Number(stats.summary.givenDebts);
    const takenDebts = Number(stats.summary.takenDebts);

    return [
      { name: "Berilgan qarzlar", value: givenDebts, color: "#60a5fa" },
      { name: "Olingan qarzlar", value: takenDebts, color: "#a78bfa" }
    ].filter(item => item.value > 0); // Only show segments with positive values
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Moliyaviy statistika</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Davr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bugun">Bugun</SelectItem>
            <SelectItem value="Bu hafta">Bu hafta</SelectItem>
            <SelectItem value="Bu oy">Bu oy</SelectItem>
            <SelectItem value="Bu yil">Bu yil</SelectItem>
            <SelectItem value="Umumiy">Umumiy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daromad</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2Icon className="w-4 h-4 text-green-500 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.summary.income)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xarajat</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2Icon className="w-4 h-4 text-red-500 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.summary.expense)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balans</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2Icon className={`w-4 h-4 ${Number(stats.summary.balance) >= 0 ? 'text-blue-600' : 'text-red-600'} animate-spin`} />
            ) : (
              <div className={`text-2xl font-bold ${Number(stats.summary.balance) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(stats.summary.balance)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jami qarzlar</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2Icon className="w-4 h-4 text-purple-500 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(Number(stats.summary.takenDebts))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Sizning qarzlaringiz
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
          <TabsTrigger value="details">Batafsil ma'lumot</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income/Expense Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Daromad va xarajatlar</CardTitle>
                <CardDescription>Daromad va xarajatlar nisbati</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareSummaryPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareSummaryPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Debts Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Qarzlar</CardTitle>
                <CardDescription>Berilgan va olingan qarzlar</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : prepareDebtsPieData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareDebtsPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareDebtsPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Qarzlar mavjud emas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Incomes */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 daromad</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {stats.topIncomes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareIncomesChart()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="amount" name="Miqdor">
                        {prepareIncomesChart().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Daromadlar mavjud emas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 xarajat</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {stats.topExpenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareExpensesChart()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="amount" name="Miqdor">
                        {prepareExpensesChart().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Xarajatlar mavjud emas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Top Debts */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 qarz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {stats.topDebts.length > 0 ? (
                  stats.topDebts.map((debt, index) => {
                    const debtorAmount = Number(debt.amount?.$numberDecimal || debt.amount);
                    const debtorPaidAmount = Number(debt.paidAmount?.$numberDecimal || debt.paidAmount || 0);
                    const ostatka = debtorAmount - debtorPaidAmount
                    return (
                      <div key={debt._id || index} className="flex items-center">
                        <div className="mr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600`}>
                            {debt.person.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{debt.person}</h3>
                            <span className={`font-bold text-purple-600`}>
                              {formatCurrency(Math.abs(ostatka))}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">
                              Qarz
                            </span>
                            <span className="text-sm text-gray-400 mx-2">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(debt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {debt.note && (
                            <p className="text-sm text-gray-600 mt-1 italic">{debt.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">Qarzlar mavjud emas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Debtors */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 qarzdorlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {stats.topDebtors.length > 0 ? (
                  stats.topDebtors.map((debtor, index) => {
                    const debtorAmount = Number(debtor.amount?.$numberDecimal || debtor.amount);
                    const debtorPaidAmount = Number(debtor.paidAmount?.$numberDecimal || debtor.paidAmount || 0);
                    const ostatka = debtorAmount - debtorPaidAmount
                    return (
                      <div key={debtor.person || index} className="flex items-center">
                        <div classNameInverse="mr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600`}>
                            {debtor.person.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{debtor.person}</h3>
                            <span className={`font-bold text-blue-600`}>
                              {formatCurrency(Math.abs(ostatka))}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">
                              <strong>{debtor.person}</strong> sizga qarzdor
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">Qarzdorlar mavjud emas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Incomes */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 daromad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topIncomes.length > 0 ? (
                  stats.topIncomes.map((income, index) => (
                    <div key={income._id || index} className="flex items-center">
                      <div className={`w-4 h-full mr-4 bg-green-400 rounded-md`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{getUzbekCategoryName(income.category)}</h3>
                          <span className="font-bold text-green-600">{formatCurrency(getAmount(income))}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(income.date).toLocaleDateString()}
                          </span>
                        </div>
                        {income.note && (
                          <p className="text-sm text-gray-600 mt-1 italic">{income.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Daromadlar mavjud emas</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 xarajat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topExpenses.length > 0 ? (
                  stats.topExpenses.map((expense, index) => (
                    <div key={expense._id || index} className="flex items-center">
                      <div className={`w-4 h-full mr-4 bg-red-400 rounded-md`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{getUzbekCategoryName(expense.category)}</h3>
                          <span className="font-bold text-red-600">{formatCurrency(getAmount(expense))}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                        {expense.note && (
                          <p className="text-sm text-gray-600 mt-1 italic">{expense.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Xarajatlar mavjud emas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}