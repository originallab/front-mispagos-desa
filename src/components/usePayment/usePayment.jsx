import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TransactionService } from '../../Api/services/TransactionService';
import { TransactionUtils } from '../../Api/utils/transactionUtils';
import { Methods } from '../../Api/services/method';

const UsePayment = () => {
  // Estados para manejar datos y UI
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Colores predefinidos para los métodos de pago
  const predefinedColors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#8B5CF6', // Violeta
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#06B6D4', // Cyan
    '#84CC16', // Verde lima
    '#F97316', // Naranja
    '#8B5A2B', // Marrón
    '#6B7280', // Gris
    '#EC4899', // Rosa
    '#14B8A6'  // Teal
  ];

  // Función para obtener datos de la base de datos
  const fetchPaymentMethodsData = async () => {
    try {
      console.log('🔄 Cargando datos de métodos de pago...');
      
      // Obtener todas las transacciones
      const transactionsResult = await TransactionService.getTransactionsForTable();
      
      if (!transactionsResult.success || !transactionsResult.data) {
        throw new Error('No se pudieron cargar las transacciones');
      }

      const transactions = transactionsResult.data;
      console.log(`📊 ${transactions.length} transacciones cargadas`);

      // Obtener todos los métodos de pago
      let methods = [];
      try {
        const methodsResult = await Methods.getAllRecords('method');
        methods = methodsResult.records || methodsResult || [];
        console.log(`💳 ${methods.length} métodos de pago disponibles`);
      } catch (methodError) {
        console.warn('⚠️ No se pudieron cargar métodos de pago:', methodError);
        // Continuar sin métodos si no están disponibles
      }

      // Filtrar solo transacciones que tienen method_id
      const transactionsWithMethod = transactions.filter(t => t.method_id);
      console.log(`🔗 ${transactionsWithMethod.length} transacciones con método de pago asignado`);

      // Agrupar transacciones por method_id
      const transactionsByMethod = TransactionUtils.groupByMethod(transactionsWithMethod);

      // Crear mapeo de métodos por ID
      const methodMap = new Map();
      methods.forEach(method => {
        methodMap.set(method.method_id, method);
      });

      // Procesar datos para el gráfico
      const paymentData = [];
      let colorIndex = 0;

      Object.entries(transactionsByMethod).forEach(([methodId, methodTransactions]) => {
        const method = methodMap.get(parseInt(methodId));
        
        if (methodTransactions.length > 0) {
          // Calcular estadísticas del método
          const stats = TransactionUtils.calculateBasicStats(methodTransactions);
          
          paymentData.push({
            id: parseInt(methodId),
            name: method ? method.method_name : `Método ${methodId}`,
            transactions: methodTransactions.length,
            totalAmount: stats.totalAmount,
            averageAmount: stats.averageAmount,
            successRate: stats.successRate,
            color: predefinedColors[colorIndex % predefinedColors.length],
            country: method ? method.country_id : null,
            isGlobal: method ? (method.global === '1' || method.global === 1) : false,
            // Datos adicionales para el tooltip
            successfulTransactions: stats.successfulCount,
            pendingTransactions: stats.pendingCount,
            failedTransactions: stats.failedCount
          });
          
          colorIndex++;
        }
      });

      // Ordenar por número de transacciones (descendente)
      paymentData.sort((a, b) => b.transactions - a.transactions);

      // Si no hay datos, mostrar mensaje
      if (paymentData.length === 0) {
        console.warn('⚠️ No se encontraron transacciones con métodos de pago asignados');
        setPaymentMethods([]);
        setTotalTransactions(0);
        setError('No se encontraron transacciones con métodos de pago');
        return;
      }

      // Actualizar estados
      setPaymentMethods(paymentData);
      setTotalTransactions(transactionsWithMethod.length);
      setError(null);
      
      console.log('✅ Datos de métodos de pago procesados:', {
        totalMethods: paymentData.length,
        totalTransactions: transactionsWithMethod.length,
        topMethod: paymentData[0]?.name
      });

    } catch (err) {
      console.error('❌ Error al cargar datos de métodos de pago:', err);
      setError(err.message || 'Error al cargar datos');
      setPaymentMethods([]);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentMethodsData();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchPaymentMethodsData();
  }, []);

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalTransactions > 0 ? 
        ((data.transactions / totalTransactions) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-600 max-w-xs">
          <p className="font-medium text-lg mb-2">{data.name}</p>
          
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-300">Transacciones:</span> 
              <span className="font-medium ml-1">{data.transactions.toLocaleString()}</span>
            </p>
            <p>
              <span className="text-gray-300">Porcentaje:</span> 
              <span className="font-medium ml-1">{percentage}%</span>
            </p>
            <p>
              <span className="text-gray-300">Monto total:</span> 
              <span className="font-medium ml-1">
                {TransactionUtils.formatAmount(data.totalAmount)}
              </span>
            </p>
            <p>
              <span className="text-gray-300">Promedio:</span> 
              <span className="font-medium ml-1">
                {TransactionUtils.formatAmount(data.averageAmount)}
              </span>
            </p>
            <p>
              <span className="text-gray-300">Tasa de éxito:</span> 
              <span className="font-medium ml-1 text-green-400">{data.successRate}%</span>
            </p>
            
            {data.country && (
              <p>
                <span className="text-gray-300">País:</span> 
                <span className="font-medium ml-1">{data.country}</span>
              </p>
            )}
            
            {data.isGlobal && (
              <p className="text-blue-400 text-xs">🌍 Método global</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Componente personalizado para la leyenda
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 max-h-32 overflow-y-auto">
        {payload.map((entry, index) => {
          const percentage = totalTransactions > 0 ? 
            ((entry.payload.transactions / totalTransactions) * 100).toFixed(1) : '0.0';
          
          return (
            <div key={index} className="flex items-center space-x-2 min-w-0">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700 truncate">
                {entry.payload.name}: {entry.payload.transactions.toLocaleString()} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Función para renderizar etiquetas personalizadas en el gráfico
  const renderLabel = (entry) => {
    const percentage = totalTransactions > 0 ? 
      ((entry.transactions / totalTransactions) * 100).toFixed(1) : '0.0';
    return parseFloat(percentage) > 5 ? `${percentage}%` : ''; // Solo mostrar si es mayor al 5%
  };

  // Componente de estado de carga
  const LoadingState = () => (
    <div className="flex items-center justify-center h-80">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando métodos de pago...</p>
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
        <p className="text-gray-600 mb-2">No hay datos de métodos de pago</p>
        <p className="text-gray-500 text-sm mb-4">
          No se encontraron transacciones con métodos de pago asignados
        </p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={refreshing}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Header con información y botón de refresh */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Uso por Método de Pago
          </h3>
          {!loading && !error && totalTransactions > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {totalTransactions.toLocaleString()} transacciones • {paymentMethods.length} métodos
            </p>
          )}
        </div>
        
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
      
      {/* Contenido principal */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : paymentMethods.length === 0 ? (
        <EmptyState />
      ) : (
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
      )}
      
      {/* Información adicional */}
      {!loading && !error && paymentMethods.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Transacciones</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalTransactions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Métodos Activos</p>
              <p className="text-lg font-semibold text-blue-600">
                {paymentMethods.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Método Principal</p>
              <p className="text-lg font-semibold text-green-600">
                {paymentMethods[0]?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio por Método</p>
              <p className="text-lg font-semibold text-purple-600">
                {Math.round(totalTransactions / paymentMethods.length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsePayment;