import React, { useState } from 'react';

const PaymentMethodsTable = () => {
  // Estado para controlar el modal y filtros
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: 'PayPal',
      logo: '🅿️',
      status: 'active',
      transactions: 3247,
      volume: 45230,
      apps: 12,
      lastActivity: '2024-01-15 14:30',
      fees: '2.9% + $0.30',
      countries: ['US', 'CA', 'MX', 'BR', 'AR']
    },
    {
      id: 2,
      name: 'Mercado Pago',
      logo: '💙',
      status: 'active',
      transactions: 2156,
      volume: 28450,
      apps: 8,
      lastActivity: '2024-01-15 13:45',
      fees: '3.5%',
      countries: ['AR', 'BR', 'MX', 'CO', 'CL']
    },
    {
      id: 3,
      name: 'Stripe',
      logo: '💳',
      status: 'active',
      transactions: 1892,
      volume: 52100,
      apps: 15,
      lastActivity: '2024-01-15 15:20',
      fees: '2.9% + $0.30',
      countries: ['US', 'CA', 'GB', 'AU', 'DE']
    },
    {
      id: 4,
      name: 'Apple Pay',
      logo: '🍎',
      status: 'active',
      transactions: 1456,
      volume: 31200,
      apps: 6,
      lastActivity: '2024-01-15 12:15',
      fees: '2.9%',
      countries: ['US', 'CA', 'GB', 'AU']
    },
    {
      id: 5,
      name: 'Google Pay',
      logo: '🔵',
      status: 'active',
      transactions: 1234,
      volume: 22800,
      apps: 9,
      lastActivity: '2024-01-15 11:30',
      fees: '2.9%',
      countries: ['US', 'IN', 'GB', 'AU']
    },
    {
      id: 6,
      name: 'Binance Pay',
      logo: '🟡',
      status: 'pending',
      transactions: 456,
      volume: 8900,
      apps: 3,
      lastActivity: '2024-01-14 16:45',
      fees: '0%',
      countries: ['Global']
    },
    {
      id: 7,
      name: 'Alipay',
      logo: '🔷',
      status: 'inactive',
      transactions: 234,
      volume: 5600,
      apps: 2,
      lastActivity: '2024-01-10 09:20',
      fees: '3.0%',
      countries: ['CN', 'HK', 'SG']
    },
    {
      id: 8,
      name: 'WeChat Pay',
      logo: '💚',
      status: 'inactive',
      transactions: 123,
      volume: 2100,
      apps: 1,
      lastActivity: '2024-01-08 14:10',
      fees: '3.0%',
      countries: ['CN', 'HK']
    }
  ]);

  // Función para obtener el estilo del estado
  const getStatusStyle = (status) => {
    const styles = {
      active: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      inactive: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
    };
    return styles[status] || styles.active;
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    const texts = {
      active: 'Activo',
      pending: 'Pendiente',
      inactive: 'Inactivo'
    };
    return texts[status] || 'Desconocido';
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Función para alternar estado
  const toggleStatus = (id) => {
    setPaymentMethods(methods => 
      methods.map(method => {
        if (method.id === id) {
          const newStatus = method.status === 'active' ? 'inactive' : 'active';
          return { ...method, status: newStatus };
        }
        return method;
      })
    );
  };

  // Función para mostrar detalles
  const showDetails = (method) => {
    setSelectedMethod(method);
    setIsModalOpen(true);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  // Función para renderizar apps conectadas
  const renderConnectedApps = (apps) => {
    const maxVisible = 3;
    const visibleApps = Math.min(apps, maxVisible);
    const remaining = Math.max(0, apps - maxVisible);

    return (
      <div className="flex items-center">
        <span className="text-sm text-gray-900 mr-2">{apps}</span>
        <div className="flex -space-x-1">
          {Array.from({ length: visibleApps }, (_, i) => (
            <div key={i} className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium">
              {i + 1}
            </div>
          ))}
          {remaining > 0 && (
            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium">
              +{remaining}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filtrar métodos según el filtro seleccionado
  const filteredMethods = statusFilter === 'all' 
    ? paymentMethods 
    : paymentMethods.filter(method => method.status === statusFilter);

  return (
    <>
      {/* Tabla de Métodos de Pago */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header con filtros */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago Configurados</h3>
            <div className="flex items-center space-x-3">
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="pending">Pendientes</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apps Conectadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMethods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                  {/* Método */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.logo}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">Comisión: {method.fees}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(method.status)}`}>
                      {getStatusText(method.status)}
                    </span>
                  </td>
                  
                  {/* Transacciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {method.transactions.toLocaleString()}
                  </td>
                  
                  {/* Volumen */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${method.volume.toLocaleString()}
                  </td>
                  
                  {/* Apps Conectadas */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderConnectedApps(method.apps)}
                  </td>
                  
                  {/* Última Actividad */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(method.lastActivity)}
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => showDetails(method)}
                      className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => toggleStatus(method.id)}
                      className="text-green-600 hover:text-green-900 mr-3 transition-colors"
                    >
                      {method.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                    <button 
                      onClick={() => alert(`Configurando ${method.name}...`)}
                      className="text-purple-600 hover:text-purple-900 transition-colors"
                    >
                      Config
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {isModalOpen && selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles de {selectedMethod.name}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información General</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Estado:</span> {getStatusText(selectedMethod.status)}</p>
                    <p><span className="font-medium">Comisiones:</span> {selectedMethod.fees}</p>
                    <p><span className="font-medium">Última actividad:</span> {selectedMethod.lastActivity}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Transacciones:</span> {selectedMethod.transactions.toLocaleString()}</p>
                    <p><span className="font-medium">Volumen:</span> ${selectedMethod.volume.toLocaleString()}</p>
                    <p><span className="font-medium">Apps conectadas:</span> {selectedMethod.apps}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Países Disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMethod.countries.map(country => (
                    <span key={country} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => alert(`Configurando ${selectedMethod.name}...`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Configurar
                </button>
                <button 
                  onClick={() => alert(`Mostrando analíticas de ${selectedMethod.name}...`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ver Analíticas
                </button>
                <button 
                  onClick={() => alert(`Probando conexión con ${selectedMethod.name}... ✅ Conexión exitosa`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Probar Conexión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethodsTable;