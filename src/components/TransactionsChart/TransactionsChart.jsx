import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TransactionService } from '../../Api/services/TransactionService';
import { TransactionUtils } from '../../Api/utils/transactionUtils';

const TransactionsChart = () => {
  // Estados para manejar datos y UI
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState('count'); // 'count' o 'amount'
  const [stats, setStats] = useState({
    dailyAverage: 0,
    weeklyGrowth: 0,
    totalTransactions: 0,
    totalAmount: 0
  });

  // Función para obtener el nombre del día en español
  const getDayName = (date, format = 'short') => {
    const days = {
      short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      long: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    };
    return days[format][date.getDay()];
  };

  // Función para generar array de los últimos N días
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date,
        dateString: date.toISOString().split('T')[0],
        dayShort: getDayName(date, 'short'),
        dayLong: getDayName(date, 'long'),
        dayNumber: date.getDate(),
        isToday: i === 0
      });
    }
    
    return days;
  };

  // Función para obtener datos de transacciones de la base de datos
  const fetchTransactionsData = async () => {
    try {
      console.log('🔄 Cargando datos de transacciones para gráfico...');
      
      // Obtener todas las transacciones
      const transactionsResult = await TransactionService.getTransactionsForTable();
      
      if (!transactionsResult.success || !transactionsResult.data) {
        throw new Error('No se pudieron cargar las transacciones');
      }

      const allTransactions = transactionsResult.data;
      console.log(`📊 ${allTransactions.length} transacciones totales cargadas`);
      
      // Debug: Mostrar estructura de las primeras transacciones
      if (allTransactions.length > 0) {
        console.log('🔍 Debug - Estructura de la primera transacción:');
        console.log(allTransactions[0]);
        
        const testTransaction = allTransactions[0];
        const testDateField = testTransaction.transaction_date || testTransaction.created_at || testTransaction.createdAt;
        
        if (testDateField) {
          console.log(`🕐 Campo de fecha encontrado: "${testDateField}"`);
          const testDate = new Date(testDateField);
          console.log(`🕐 Fecha parseada: ${testDate.toISOString()}`);
          console.log(`🕐 Es válida: ${!isNaN(testDate.getTime())}`);
          
          // Verificar si está en los últimos 7 días
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const isRecent = testDate >= sevenDaysAgo;
          console.log(`🕐 Está en últimos 7 días: ${isRecent} (límite: ${sevenDaysAgo.toLocaleDateString()})`);
        } else {
          console.warn('⚠️ No se encontró campo de fecha en la primera transacción');
        }
      }

      // Obtener los últimos 7 días
      const last7Days = getLast7Days();
      console.log('📅 Últimos 7 días a analizar:', last7Days.map(d => d.dateString));

      // Filtrar transacciones de los últimos 14 días
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const last14DaysTransactions = allTransactions.filter(transaction => {
        const dateField = transaction.transaction_date || transaction.created_at || transaction.createdAt;
        
        if (!dateField) {
          return false;
        }
        
        const transactionDate = new Date(dateField);
        if (isNaN(transactionDate.getTime())) {
          return false;
        }
        
        return transactionDate >= fourteenDaysAgo;
      });

      console.log(`📅 ${last14DaysTransactions.length} transacciones de los últimos 14 días`);

      // Agrupar transacciones por fecha usando TransactionUtils
      const transactionsByDate = TransactionUtils.groupByDate(last14DaysTransactions);
      
      console.log('📅 Agrupación por fecha:');
      Object.keys(transactionsByDate).forEach(date => {
        console.log(`  ${date}: ${transactionsByDate[date].length} transacciones`);
      });

      // Procesar datos para los últimos 7 días
      const chartDataArray = last7Days.map(day => {
        const dayTransactions = transactionsByDate[day.dateString] || [];
        const dayStats = TransactionUtils.calculateBasicStats(dayTransactions);
        
        if (dayTransactions.length > 0) {
          console.log(`📊 ${day.dateString} (${day.dayLong}): ${dayTransactions.length} transacciones`);
        }
        
        return {
          day: day.dayShort,
          fullDay: day.dayLong,
          date: day.dateString,
          dayNumber: day.dayNumber,
          isToday: day.isToday,
          transactions: dayTransactions.length,
          amount: dayStats.totalAmount,
          averageAmount: dayStats.averageAmount,
          successfulTransactions: dayStats.successfulCount,
          pendingTransactions: dayStats.pendingCount,
          failedTransactions: dayStats.failedCount,
          successRate: dayStats.successRate
        };
      });

      // Calcular estadísticas
      const currentWeekTransactions = chartDataArray.reduce((sum, day) => sum + day.transactions, 0);
      const currentWeekAmount = chartDataArray.reduce((sum, day) => sum + day.amount, 0);

      // Obtener datos de la semana anterior para comparación
      const previous7Days = [];
      for (let i = 13; i >= 7; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        previous7Days.push(date.toISOString().split('T')[0]);
      }

      const previousWeekTransactions = previous7Days.reduce((sum, dateString) => {
        const dayTransactions = transactionsByDate[dateString] || [];
        return sum + dayTransactions.length;
      }, 0);

      const previousWeekAmount = previous7Days.reduce((sum, dateString) => {
        const dayTransactions = transactionsByDate[dateString] || [];
        const dayStats = TransactionUtils.calculateBasicStats(dayTransactions);
        return sum + dayStats.totalAmount;
      }, 0);

      // Calcular crecimiento
      const weeklyGrowthCount = previousWeekTransactions > 0 ? 
        (((currentWeekTransactions - previousWeekTransactions) / previousWeekTransactions) * 100) : 0;
      
      const weeklyGrowthAmount = previousWeekAmount > 0 ? 
        (((currentWeekAmount - previousWeekAmount) / previousWeekAmount) * 100) : 0;

      // Actualizar estados
      setChartData(chartDataArray);
      setStats({
        dailyAverage: chartType === 'count' ? 
          (currentWeekTransactions / 7) : (currentWeekAmount / 7),
        weeklyGrowth: chartType === 'count' ? weeklyGrowthCount : weeklyGrowthAmount,
        totalTransactions: currentWeekTransactions,
        totalAmount: currentWeekAmount,
        weeklyGrowthCount,
        weeklyGrowthAmount
      });
      
      setError(null);
      
      console.log('✅ Datos del gráfico procesados:', {
        days: chartDataArray.length,
        totalTransactions: currentWeekTransactions,
        dailyAverage: Math.round(currentWeekTransactions / 7),
        weeklyGrowth: Math.round(weeklyGrowthCount)
      });

    } catch (err) {
      console.error('❌ Error al cargar datos del gráfico:', err);
      setError(err.message || 'Error al cargar datos');
      setChartData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactionsData();
  };

  // Función para cambiar tipo de gráfico
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    
    // Actualizar estadística promedio según el tipo
    setStats(prevStats => ({
      ...prevStats,
      dailyAverage: newType === 'count' ? 
        (prevStats.totalTransactions / 7) : (prevStats.totalAmount / 7),
      weeklyGrowth: newType === 'count' ? 
        prevStats.weeklyGrowthCount : prevStats.weeklyGrowthAmount
    }));
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTransactionsData();
  }, []);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const dayData = chartData.find(d => d.day === label);
      
      if (!dayData) return null;
      
      return (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-600 max-w-xs">
          <div className="mb-2">
            <p className="font-medium text-sm">{dayData.fullDay}</p>
            <p className="text-xs text-gray-300">{dayData.date}</p>
            {dayData.isToday && (
              <span className="inline-block bg-blue-500 text-xs px-2 py-1 rounded-full mt-1">
                Hoy
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="text-blue-300">
              <span className="font-semibold">{dayData.transactions.toLocaleString()}</span> transacciones
            </p>
            <p className="text-green-300">
              <span className="font-semibold">
                {TransactionUtils.formatAmount(dayData.amount)}
              </span> total
            </p>
            {dayData.transactions > 0 && (
              <>
                <p className="text-yellow-300">
                  <span className="font-semibold">
                    {TransactionUtils.formatAmount(dayData.averageAmount)}
                  </span> promedio
                </p>
                <p className="text-purple-300">
                  <span className="font-semibold">{dayData.successRate}%</span> éxito
                </p>
                
                <div className="pt-2 border-t border-gray-600 text-xs space-y-1">
                  <p>✅ {dayData.successfulTransactions} exitosas</p>
                  <p>⏳ {dayData.pendingTransactions} pendientes</p>
                  <p>❌ {dayData.failedTransactions} fallidas</p>
                </div>
              </>
            )}
            
            {dayData.transactions === 0 && (
              <p className="text-gray-400 text-xs">Sin transacciones</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Función para formatear valores del eje Y
  const formatYAxisTick = (value) => {
    if (chartType === 'amount') {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      }
      return `$${value}`;
    } else {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
      }
      return value.toString();
    }
  };

  // Componente de estado de carga
  const LoadingState = () => (
    <div className="flex items-center justify-center h-80">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando datos de transacciones...</p>
      </div>
    </div>
  );

  // Componente de estado de error
  const ErrorState = () => (
    <div className="flex items-center justify-center h-80">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={refreshing}
        >
          {refreshing ? 'Cargando...' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="flex items-center justify-center h-80">
      <div className="text-center">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <p className="text-gray-600 mb-2">No hay transacciones en los últimos 7 días</p>
        <p className="text-gray-500 text-sm mb-4">
          Las transacciones aparecerán aquí una vez que se registren en el sistema
        </p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={refreshing}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-left max-w-md mx-auto">
          <p className="font-medium text-gray-700 mb-2">Información de debug:</p>
          <p>• Campo de fecha: transaction_date, created_at, o createdAt</p>
          <p>• Formato esperado: YYYY-MM-DD HH:mm:ss</p>
          <p>• Rango de fechas: Últimos 7 días</p>
        </div>
      </div>
    </div>
  );

  // Función para obtener el color del crecimiento
  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Función para obtener el icono del crecimiento
  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  // Verificar si hay datos para mostrar
  const hasData = chartData.length > 0 && chartData.some(d => d.transactions > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Header con controles */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Transacciones Últimos 7 Días
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {chartType === 'count' ? 'Número de transacciones' : 'Monto total procesado'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Selector de tipo de gráfico */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleChartTypeChange('count')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'count' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => handleChartTypeChange('amount')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'amount' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monto
            </button>
          </div>

          {/* Botón de refresh */}
          {!loading && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Contenido principal */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  dataKey={chartType === 'count' ? 'transactions' : 'amount'}
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
          
          {/* Estadísticas adicionales */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Promedio diario:</span> {' '}
              {chartType === 'count' 
                ? Math.round(stats.dailyAverage).toLocaleString()
                : TransactionUtils.formatAmount(stats.dailyAverage)
              }
            </div>
            <div className={`font-medium flex items-center space-x-1 ${getGrowthColor(stats.weeklyGrowth)}`}>
              <span>{getGrowthIcon(stats.weeklyGrowth)}</span>
              <span>
                {stats.weeklyGrowth > 0 ? '+' : ''}{stats.weeklyGrowth.toFixed(1)}% vs semana anterior
              </span>
            </div>
          </div>

          {/* Panel de estadísticas detalladas */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Semana</p>
                <p className="text-lg font-semibold text-gray-900">
                  {chartType === 'count' 
                    ? stats.totalTransactions.toLocaleString()
                    : TransactionUtils.formatAmount(stats.totalAmount)
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Mejor Día</p>
                <p className="text-lg font-semibold text-blue-600">
                  {chartData.length > 0 ? (
                    chartType === 'count' 
                      ? Math.max(...chartData.map(d => d.transactions)).toLocaleString()
                      : TransactionUtils.formatAmount(Math.max(...chartData.map(d => d.amount)))
                  ) : '0'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Promedio Éxito</p>
                <p className="text-lg font-semibold text-green-600">
                  {chartData.length > 0 
                    ? Math.round(chartData.reduce((sum, d) => sum + d.successRate, 0) / chartData.length)
                    : 0
                  }%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Días Activos</p>
                <p className="text-lg font-semibold text-purple-600">
                  {chartData.filter(d => d.transactions > 0).length}/7
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsChart;