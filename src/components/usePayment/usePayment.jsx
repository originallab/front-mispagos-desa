import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const UsePayment = () => {
  // Datos de ejemplo para métodos de pago
  const paymentMethods = [
    { name: 'PayPal', transactions: 3247, color: '#3B82F6' },
    { name: 'Mercado Pago', transactions: 2156, color: '#10B981' },
    { name: 'Stripe', transactions: 1892, color: '#8B5CF6' },
    { name: 'Apple Pay', transactions: 1456, color: '#F59E0B' },
    { name: 'Google Pay', transactions: 1234, color: '#EF4444' },
    { name: 'Binance Pay', transactions: 456, color: '#06B6D4' },
    { name: 'Alipay', transactions: 234, color: '#84CC16' },
    { name: 'WeChat Pay', transactions: 123, color: '#F97316' }
  ];

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = paymentMethods.reduce((sum, method) => sum + method.transactions, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-600">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm">{`${data.value.toLocaleString()} transacciones`}</p>
          <p className="text-sm text-gray-300">{`${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Componente personalizado para la leyenda
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-700">
              {entry.payload.name}: {entry.payload.transactions.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar etiquetas personalizadas
  const renderLabel = (entry) => {
    const total = paymentMethods.reduce((sum, method) => sum + method.transactions, 0);
    const percentage = ((entry.transactions / total) * 100).toFixed(1);
    return percentage > 5 ? `${percentage}%` : ''; // Solo mostrar porcentaje si es mayor al 5%
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Uso por Método de Pago
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentMethods}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="transactions"
              animationBegin={0}
              animationDuration={800}
            >
              {paymentMethods.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsePayment;