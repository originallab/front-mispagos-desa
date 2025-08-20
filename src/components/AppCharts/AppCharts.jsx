import React, { useState, useEffect } from 'react';

// Imports reales de los servicios y utilidades refactorizados
import { ChartService } from '../../Api/services/chartService.js';
import { ChartUtils } from '../../Api/utils/chartUtils.js';

const AppCharts = () => {
  // Estado para los datos de los gráficos
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dataSource, setDataSource] = useState({});
  const [dashboardCards, setDashboardCards] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear()
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadChartData();
  }, [filters]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Cargando datos reales desde la base de datos...');
      
      // Obtener datos del dashboard usando el servicio refactorizado
      const dashboardResult = await ChartService.getDashboardMetrics();
      
      if (dashboardResult.success) {
        console.log('📈 Dashboard obtenido:', dashboardResult.data);
        
        // Formatear datos de ingresos usando ChartUtils refactorizado
        const formattedRevenue = ChartUtils.formatMonthlyRevenueForChart(
          dashboardResult.data.revenue?.data || []
        );
        
        // Formatear datos de usuarios usando ChartUtils refactorizado
        const formattedUsers = ChartUtils.formatUserGrowthForChart(
          dashboardResult.data.users?.data || []
        );

        // Formatear cards del dashboard
        const formattedCards = ChartUtils.formatDashboardCards(dashboardResult.data);
        
        setRevenueData(formattedRevenue);
        setUserData(formattedUsers);
        setDashboardCards(formattedCards);
        setSummary({
          revenue: dashboardResult.data.revenue?.summary || {},
          users: dashboardResult.data.users?.summary || {},
          apps: dashboardResult.data.apps?.summary || {},
          payments: dashboardResult.data.payments?.summary || {}
        });

        // Guardar información del origen de datos
        setDataSource({
          revenue: dashboardResult.data.revenue?.summary?.source || 'unknown',
          users: dashboardResult.data.users?.summary?.source || 'unknown',
          apps: dashboardResult.data.apps?.summary?.source || 'unknown',
          payments: dashboardResult.data.payments?.summary?.source || 'unknown',
          generatedAt: dashboardResult.data.generatedAt
        });
        
        console.log('✅ Datos cargados exitosamente desde BD');
        console.log('🏷️ Fuentes de datos:', {
          revenue: dashboardResult.data.revenue?.summary?.source,
          users: dashboardResult.data.users?.summary?.source,
          apps: dashboardResult.data.apps?.summary?.source
        });
        
      } else {
        throw new Error('Error al obtener datos del dashboard');
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos reales:', error);
      setError(error.message);
      
      // Usar datos por defecto con marcas claras de fallback
      console.log('🔄 Usando datos de fallback...');
      setRevenueData(ChartUtils.getDefaultMonthlyRevenue());
      setUserData(ChartUtils.getDefaultUserGrowth());
      setDashboardCards(ChartUtils.getDefaultDashboardCards());
      setSummary({
        revenue: { total_revenue: 1533000, average_monthly: 127750, source: 'fallback' },
        users: { total_users: 9200, growth_rate: 25.6, source: 'fallback' },
        apps: { total: 3, active: 3, source: 'fallback' }
      });
      setDataSource({
        revenue: 'fallback',
        users: 'fallback',
        apps: 'fallback',
        payments: 'fallback'
      });
      
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleString());
    }
  };

  // Función para refrescar datos
  const refreshData = async () => {
    try {
      console.log('🔄 Refrescando datos desde BD...');
      // Intentar refrescar métricas si está disponible
      await ChartService.refreshMetrics();
      console.log('📊 Métricas actualizadas');
    } catch (refreshError) {
      console.log('ℹ️ Refresh no disponible, recargando datos...');
    }
    loadChartData();
  };

  // Función para cambiar año
  const handleYearChange = (year) => {
    setFilters(prev => ({ ...prev, year }));
  };

  // Función para determinar si los datos son reales
  const isRealData = (source) => {
    return source && (source.includes('real') || source.includes('apps'));
  };

  // Función para obtener etiqueta del origen de datos
  const getDataSourceLabel = (source) => {
    const sourceLabels = {
      'real_transactions': 'Transacciones Reales',
      'real_users_simulated_growth': 'Usuarios Reales + Crecimiento Simulado',
      'simulated_from_apps': 'Simulado desde Apps Reales',
      'real_apps': 'Aplicaciones Reales',
      'real_methods_simulated_stats': 'Métodos Reales + Stats Simuladas',
      'fallback': 'Datos de Ejemplo',
      'default': 'Datos por Defecto'
    };
    return sourceLabels[source] || source || 'Desconocido';
  };

  // Componente de grÃ¡fico lineal personalizado mejorado
  const LineChart = ({ title, data, color, summary, type, onRefresh, source }) => {
    const chartWidth = 400;
    const chartHeight = 200;
    const padding = 40;
    const actualWidth = chartWidth - padding * 2;
    const actualHeight = chartHeight - padding * 2;

    // Calcular escalas
    const maxValue = Math.max(...data.map(d => d.valor), 1);
    const minValue = Math.min(...data.map(d => d.valor), 0);
    const valueRange = maxValue - minValue || 1;

    // Generar puntos para la línea
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * actualWidth;
      const y = padding + actualHeight - ((item.valor - minValue) / valueRange) * actualHeight;
      return { x, y, data: item };
    });

    // Crear path para la línea
    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
      .join(' ');

    // Crear path para el área bajo la línea
    const areaPath = `${linePath} L ${points[points.length - 1].x},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`;

    // Función para formatear valor en tooltip
    const formatTooltipValue = (item) => {
      return type === 'revenue' ? 
        ChartUtils.formatCurrency(item.rawValue || item.valor * 1000) : 
        ChartUtils.formatNumber(item.rawValue || item.valor);
    };

    // Determinar color del indicador de datos reales/simulados
    const getDataIndicatorColor = () => {
      if (isRealData(source)) {
        return 'bg-green-100 text-green-800';
      } else {
        return 'bg-yellow-100 text-yellow-800';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg hover:shadow-xl transition-shadow">
        {/* Header del gráfico */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-800 font-semibold text-lg">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDataIndicatorColor()}`}>
              {isRealData(source) ? '🟢 Real' : '🟡 Simulado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm text-gray-600">{filters.year}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                title="Refrescar datos"
              >
                🔄
              </button>
            )}
          </div>
        </div>

        {/* Data source info */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <span className="text-gray-600">Fuente: </span>
          <span className="font-medium">{getDataSourceLabel(source)}</span>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-sm font-semibold">
                {type === 'revenue' 
                  ? ChartUtils.formatCurrency(summary.total_revenue || 0)
                  : ChartUtils.formatNumber(summary.total_users || 0)
                }
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500">
                {type === 'revenue' ? 'Promedio' : 'Crecimiento'}
              </div>
              <div className="text-sm font-semibold">
                {type === 'revenue' 
                  ? ChartUtils.formatCurrency(summary.average_monthly || 0)
                  : `+${(summary.growth_rate || 0).toFixed(1)}%`
                }
              </div>
            </div>
          </div>
        )}
        
        {/* Gráfico lineal SVG */}
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Grilla de fondo */}
            <defs>
              <pattern id={`grid-${type}`} width="40" height="25" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={chartWidth} height={chartHeight} fill={`url(#grid-${type})`} />
            
            {/* Área bajo la curva */}
            <path
              d={areaPath}
              fill={color.replace('bg-', '').replace('-500', '')}
              fillOpacity="0.1"
              className="transition-all duration-300"
            />
            
            {/* Línea principal */}
            <path
              d={linePath}
              fill="none"
              stroke={color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3B82F6' : '#10B981'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            {/* Puntos de datos */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="white"
                  stroke={color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3B82F6' : '#10B981'}
                  strokeWidth="2"
                  className="hover:r-6 transition-all duration-200 cursor-pointer drop-shadow-sm"
                />
                
                {/* Tooltip invisible para hover */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>
                    {point.data.mes}: {formatTooltipValue(point.data)}
                    {point.data.transactions && ` (${point.data.transactions} transacciones)`}
                    {point.data.source && ` - ${point.data.source}`}
                  </title>
                </circle>
              </g>
            ))}
            
            {/* Etiquetas del eje X */}
            {points.map((point, index) => (
              index % 2 === 0 && (
                <text
                  key={`label-${index}`}
                  x={point.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  {point.data.mes}
                </text>
              )
            ))}
            
            {/* Valores máximo y mínimo en eje Y */}
            <text x="5" y={padding + 5} className="text-xs fill-gray-500">
              {type === 'revenue' ? ChartUtils.formatCurrency(maxValue * 1000) : ChartUtils.formatNumber(maxValue)}
            </text>
            <text x="5" y={chartHeight - padding + 5} className="text-xs fill-gray-500">
              {type === 'revenue' ? ChartUtils.formatCurrency(minValue * 1000) : ChartUtils.formatNumber(minValue)}
            </text>
          </svg>
        </div>

        {/* Footer con información adicional */}
        <div className="border-t pt-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {type === 'revenue' ? 'Ingresos en miles USD' : 'Usuarios registrados'}
            </span>
            {summary?.active_apps && (
              <span className="text-xs text-blue-600">
                Basado en {summary.active_apps} apps activas
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 p-8">
        <div className="flex flex-wrap gap-8 justify-center items-center">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const availableYears = [2023, 2024, 2025];

  return (
    <div className="bg-gray-50 p-8">
      {/* Header con controles */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard de Análisis</h2>
          <p className="text-gray-600">
            Métricas de rendimiento desde base de datos real
            {dataSource.generatedAt && (
              <span className="ml-2 text-sm text-blue-600">
                (Actualizado: {new Date(dataSource.generatedAt).toLocaleString()})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Selector de año */}
          <select
            value={filters.year}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Actualizado: {lastUpdated}
            </span>
          )}
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            🔄 Refrescar desde BD
          </button>
        </div>
      </div>

      {/* Indicadores de estado de datos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(dataSource).filter(([key]) => key !== 'generatedAt').map(([key, source]) => (
          <div key={key} className="bg-white rounded-lg p-3 text-center shadow">
            <div className="text-sm font-medium text-gray-700 capitalize">{key}</div>
            <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
              isRealData(source) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isRealData(source) ? '🟢 Real' : '🟡 Simulado'}
            </div>
            <div className="text-xs text-gray-500 mt-1">{getDataSourceLabel(source)}</div>
          </div>
        ))}
      </div>

      {/* Mensaje de información sobre datos */}
      {(error || !isRealData(dataSource.revenue)) && (
        <div className={`border px-4 py-3 rounded mb-6 ${
          error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700'
        }`}>
          <strong>{error ? 'Error:' : 'Información:'}</strong> 
          {error ? (
            <span> No se pudieron cargar todos los datos reales. Error: {error}</span>
          ) : (
            <span> Los datos mostrados son una combinación de información real de la base de datos y simulaciones basadas en esos datos reales.</span>
          )}
        </div>
      )}

      {/* Gráficos lineales */}
      <div className="flex flex-wrap gap-8 justify-center items-start">
        <LineChart
          title="Ingresos Mensuales"
          data={revenueData}
          color="bg-blue-500"
          summary={summary?.revenue}
          type="revenue"
          source={dataSource.revenue}
          onRefresh={refreshData}
        />
        
        <LineChart
          title="Crecimiento de Usuarios"
          data={userData}
          color="bg-green-500"
          summary={summary?.users}
          type="users"
          source={dataSource.users}
          onRefresh={refreshData}
        />
      </div>

      {/* Cards de métricas desde datos reales */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 text-center relative">
            {/* Indicador de datos reales */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
              card.isReal ? 'bg-green-400' : 'bg-yellow-400'
            }`} title={card.isReal ? 'Datos reales' : 'Datos simulados'}></div>
            
            <div className={`text-2xl font-bold mb-2 ${
              card.color === 'blue' ? 'text-blue-600' :
              card.color === 'green' ? 'text-green-600' :
              card.color === 'purple' ? 'text-purple-600' :
              card.color === 'orange' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {card.value}
            </div>
            <div className="text-sm text-gray-600 mb-1">{card.title}</div>
            <div className={`text-xs mb-2 ${
              card.changeType === 'positive' ? 'text-green-600' :
              card.changeType === 'negative' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {card.change}
            </div>
            <div className="text-xs text-gray-500">{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Summary footer con tendencias y origen de datos */}
      {summary && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Tendencias desde Base de Datos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Rendimiento de Ingresos</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total del año:</span>
                  <span className="text-sm font-medium">
                    {ChartUtils.formatCurrency(summary.revenue?.total_revenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fuente:</span>
                  <span className="text-sm font-medium">
                    {getDataSourceLabel(summary.revenue?.source)}
                  </span>
                </div>
                {summary.revenue?.active_apps && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Apps activas:</span>
                    <span className="text-sm font-medium">{summary.revenue.active_apps}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Crecimiento de Usuarios</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de usuarios:</span>
                  <span className="text-sm font-medium">
                    {ChartUtils.formatNumber(summary.users?.total_users || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fuente:</span>
                  <span className="text-sm font-medium">
                    {getDataSourceLabel(summary.users?.source)}
                  </span>
                </div>
                {summary.users?.total_user_apps && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Relaciones usuario-app:</span>
                    <span className="text-sm font-medium">{summary.users.total_user_apps}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Estado de Aplicaciones</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de apps:</span>
                  <span className="text-sm font-medium">
                    {summary.apps?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Apps activas:</span>
                  <span className="text-sm font-medium text-green-600">
                    {summary.apps?.active || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fuente:</span>
                  <span className="text-sm font-medium">
                    {getDataSourceLabel(summary.apps?.source)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCharts;