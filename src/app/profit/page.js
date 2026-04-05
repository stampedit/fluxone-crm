'use client';

import { useState, useEffect } from 'react';
import { getClients } from '@/services/dataService';
import Navigation from '@/components/Navigation';

export default function ProfitPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitMetrics = (client) => {
    const profitPerClean = client.pricing.pricePerClean - client.pricing.employeePay;
    const monthlyProfit = profitPerClean * client.pricing.frequency;
    const yearlyProfit = monthlyProfit * 12;
    
    return {
      profitPerClean,
      monthlyProfit,
      yearlyProfit
    };
  };

  const getTotalMetrics = () => {
    return clients.reduce((totals, client) => {
      const metrics = calculateProfitMetrics(client);
      totals.totalMonthlyProfit += metrics.monthlyProfit;
      totals.totalYearlyProfit += metrics.yearlyProfit;
      totals.totalRevenue += client.pricing.pricePerClean * client.pricing.frequency;
      totals.totalCosts += client.pricing.employeePay * client.pricing.frequency;
      return totals;
    }, {
      totalMonthlyProfit: 0,
      totalYearlyProfit: 0,
      totalRevenue: 0,
      totalCosts: 0
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totals = getTotalMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading profit data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="md:ml-64 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profit Analysis</h1>
          <p className="text-gray-600 mt-2">Track your revenue, costs, and profitability</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.totalRevenue)}</p>
              </div>
              <div className="text-3xl">💵</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Monthly Costs</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalCosts)}</p>
              </div>
              <div className="text-3xl">💸</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Monthly Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalMonthlyProfit)}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Yearly Profit</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totals.totalYearlyProfit)}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profit Margins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Monthly Profit Margin</span>
                <span className="text-sm font-medium">
                  {totals.totalRevenue > 0 ? ((totals.totalMonthlyProfit / totals.totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${totals.totalRevenue > 0 ? (totals.totalMonthlyProfit / totals.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Average Profit per Client</span>
                <span className="text-sm font-medium">
                  {formatCurrency(clients.length > 0 ? totals.totalMonthlyProfit / clients.length : 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (clients.length > 0 ? (totals.totalMonthlyProfit / clients.length) / 1000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Client Profit Breakdown</h2>
          </div>
          
          {clients.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No clients to analyze. Add clients to see profit data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price per Clean
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit per Clean
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => {
                    const metrics = calculateProfitMetrics(client);
                    const profitMargin = client.pricing.pricePerClean > 0 
                      ? (metrics.profitPerClean / client.pricing.pricePerClean) * 100 
                      : 0;
                    
                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {client.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.contactName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(client.pricing.pricePerClean)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(client.pricing.employeePay)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.pricing.frequency}/month
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${metrics.profitPerClean >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(metrics.profitPerClean)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${metrics.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(metrics.monthlyProfit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${profitMargin >= 30 ? 'bg-green-600' : profitMargin >= 15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(100, profitMargin)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900">
                      Totals
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(clients.reduce((sum, client) => {
                        const metrics = calculateProfitMetrics(client);
                        return sum + metrics.profitPerClean;
                      }, 0))}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(totals.totalMonthlyProfit)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {totals.totalRevenue > 0 ? ((totals.totalMonthlyProfit / totals.totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Top Performing Client</h3>
              <p className="text-sm text-blue-700">
                {clients.length > 0 
                  ? clients.reduce((best, client) => {
                      const metrics = calculateProfitMetrics(client);
                      const bestMetrics = calculateProfitMetrics(best);
                      return metrics.monthlyProfit > bestMetrics.monthlyProfit ? client : best;
                    }).businessName
                  : 'No clients yet'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Average Profit Margin</h3>
              <p className="text-sm text-green-700">
                {totals.totalRevenue > 0 ? ((totals.totalMonthlyProfit / totals.totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Growth Potential</h3>
              <p className="text-sm text-purple-700">
                Add {Math.max(0, Math.ceil((5000 - totals.totalMonthlyProfit) / (totals.totalMonthlyProfit / Math.max(1, clients.length))))} more clients to reach $5k/month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
