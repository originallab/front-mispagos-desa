import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const TransactionsChart = () => {
  // Datos de ejemplo para transacciones de los últimos 7 días
  const transactionsData = [
    { day: 'Lun', transactions: 1200, fullDay: 'Lunes' },
    { day: 'Mar', transactions: 1350, fullDay: 'Martes' },
    { day: 'Mié', transactions: 1100, fullDay: 'Miércoles' },
    { day: 'Jue', transactions: 1400, fullDay: 'Jueves' },
    { day: 'Vie', transactions: 1600, fullDay: 'Viernes' },
    { day: 'Sáb', transactions: 1300, fullDay: 'Sábado' },
    { day: 'Dom', transactions: 1247, fullDay: 'Domingo' }
  ];

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const dayData = transactionsData.find(d => d.day === label);
      
      return (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-600">
          <p className="font-medium text-sm">{dayData?.fullDay}</p>
          <p className="text-blue-300">
            <span className="font-semibold">{data.value.toLocaleString()}</span> transacciones
          </p>
        </div>
      );
    }
    return null;
  };

  // Función para formatear valores del eje Y
  const formatYAxisTick = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transacciones Últimos 7 Días
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transactionsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="transactionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              horizontal={true}
              vertical={false}
            />
            
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#6B7280',
                fontFamily: 'Inter'
              }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#6B7280',
                fontFamily: 'Inter'
              }}
              tickFormatter={formatYAxisTick}
              domain={[0, 'dataMax']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="transactions"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#transactionsGradient)"
              activeDot={{ 
                r: 6, 
                fill: '#3B82F6',
                stroke: '#fff',
                strokeWidth: 2
              }}
              dot={{ 
                r: 4, 
                fill: '#3B82F6',
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Estadística adicional */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          <span className="font-medium">Promedio diario:</span> {Math.round(transactionsData.reduce((acc, curr) => acc + curr.transactions, 0) / 7).toLocaleString()}
        </div>
        <div className="text-green-600 font-medium">
          +18% vs semana anterior
        </div>
      </div>
    </div>
  );
};

export default TransactionsChart;