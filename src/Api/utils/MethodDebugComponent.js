import React, { useState } from 'react';
import { MethodUtils } from '../../Api/services/methodUtils';
import { AlertCircle, CheckCircle, Info, Database, Send } from 'lucide-react';

const MethodDebugComponent = () => {
  const [debugResults, setDebugResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    name: 'Test Method',
    status: 'activo',
    global: 1,
    commission: 2.5,
    type: 'Test Type'
  });

  const addResult = (test, success, data, error = null) => {
    setDebugResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const testMinimalPayload = async () => {
    try {
      const minimalData = {
        name: 'Test Minimal'
      };
      
      console.log('🧪 Probando payload mínimo:', minimalData);
      const result = await MethodUtils.createMethod(minimalData);
      addResult('Payload Mínimo (solo name)', true, result);
    } catch (error) {
      console.error('❌ Error con payload mínimo:', error);
      addResult('Payload Mínimo (solo name)', false, null, {
        status: error.response?.status,
        message: error.message,
        detail: error.response?.data?.detail,
        responseData: error.response?.data
      });
    }
  };

  const testBasicPayload = async () => {
    try {
      const basicData = {
        name: 'Test Basic',
        status: 'activo',
        global: 0
      };
      
      console.log('🧪 Probando payload básico:', basicData);
      const result = await MethodUtils.createMethod(basicData);
      addResult('Payload Básico (name, status, global)', true, result);
    } catch (error) {
      console.error('❌ Error con payload básico:', error);
      addResult('Payload Básico (name, status, global)', false, null, {
        status: error.response?.status,
        message: error.message,
        detail: error.response?.data?.detail,
        responseData: error.response?.data
      });
    }
  };

  const testFullPayload = async () => {
    try {
      const fullData = {
        name: 'Test Full',
        status: 'activo',
        global: 1,
        commission: 2.5,
        type: 'Test Type'
      };
      
      console.log('🧪 Probando payload completo:', fullData);
      const result = await MethodUtils.createMethod(fullData);
      addResult('Payload Completo (todos los campos)', true, result);
    } catch (error) {
      console.error('❌ Error con payload completo:', error);
      addResult('Payload Completo (todos los campos)', false, null, {
        status: error.response?.status,
        message: error.message,
        detail: error.response?.data?.detail,
        responseData: error.response?.data
      });
    }
  };

  const testCustomPayload = async () => {
    try {
      console.log('🧪 Probando payload personalizado:', testData);
      const result = await MethodUtils.createMethod(testData);
      addResult('Payload Personalizado', true, result);
    } catch (error) {
      console.error('❌ Error con payload personalizado:', error);
      addResult('Payload Personalizado', false, null, {
        status: error.response?.status,
        message: error.message,
        detail: error.response?.data?.detail,
        responseData: error.response?.data
      });
    }
  };

  const testGetMethods = async () => {
    try {
      const methods = await MethodUtils.getAllMethods();
      addResult('Obtener Métodos Existentes', true, {
        count: methods.length,
        sample: methods[0] || null,
        allMethods: methods
      });
      
      if (methods.length > 0) {
        console.log('📊 Estructura de método existente:', methods[0]);
        console.log('🔍 Campos disponibles:', Object.keys(methods[0]));
      }
    } catch (error) {
      addResult('Obtener Métodos Existentes', false, null, error.message);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    console.log('🔬 Iniciando tests de debugging...');
    
    // Test 1: Obtener métodos existentes para ver la estructura
    await testGetMethods();
    
    // Test 2: Payload mínimo
    await testMinimalPayload();
    
    // Test 3: Payload básico
    await testBasicPayload();
    
    // Test 4: Payload completo
    await testFullPayload();
    
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: field === 'global' ? parseInt(value) : 
               field === 'commission' ? parseFloat(value) : 
               value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Database className="h-8 w-8 mr-3 text-blue-600" />
          🔬 Debug: Error 422 - Métodos de Pago
        </h2>
        <p className="text-gray-600">
          Herramienta para identificar qué estructura de datos espera exactamente la API.
        </p>
      </div>

      {/* Controles de testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🧪 Tests Automáticos</h3>
          <div className="space-y-3">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Ejecutando tests...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Ejecutar Todos los Tests</span>
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={testGetMethods}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Ver Estructura
              </button>
              <button
                onClick={testMinimalPayload}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Test Mínimo
              </button>
              <button
                onClick={testBasicPayload}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Test Básico
              </button>
              <button
                onClick={testFullPayload}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                Test Completo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Test Personalizado</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={testData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Test Method"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={testData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="activo">activo</option>
                  <option value="inactivo">inactivo</option>
                  <option value="en revision">en revision</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Global</label>
                <select
                  value={testData.global}
                  onChange={(e) => handleInputChange('global', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={0}>0 (Sin estado)</option>
                  <option value={1}>1 (Global)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión</label>
                <input
                  type="number"
                  step="0.01"
                  value={testData.commission}
                  onChange={(e) => handleInputChange('commission', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <input
                  type="text"
                  value={testData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Test Type"
                />
              </div>
            </div>
            
            <button
              onClick={testCustomPayload}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Probar Datos Personalizados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {debugResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">📊 Resultados de Debug</h3>
            <button
              onClick={clearResults}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Limpiar resultados
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {debugResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.test}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>

                {result.success ? (
                  <div className="bg-white p-3 rounded text-xs overflow-x-auto">
                    <pre className="text-green-700 whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded">
                      <p className="text-red-700 text-sm font-medium mb-2">Error Details:</p>
                      
                      {result.error.status && (
                        <p className="text-xs text-red-600 mb-1">
                          <strong>Status:</strong> {result.error.status}
                        </p>
                      )}
                      
                      <p className="text-xs text-red-600 mb-2">
                        <strong>Message:</strong> {result.error.message}
                      </p>
                      
                      {result.error.detail && (
                        <div className="mb-2">
                          <p className="text-xs text-red-600 mb-1"><strong>Detail:</strong></p>
                          <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                            {typeof result.error.detail === 'string' 
                              ? result.error.detail 
                              : JSON.stringify(result.error.detail, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {result.error.responseData && (
                        <div>
                          <p className="text-xs text-red-600 mb-1"><strong>Full Response:</strong></p>
                          <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.error.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📈 Resumen de Tests</h4>
            <div className="flex space-x-4 text-sm">
              <span className="text-green-600">
                ✅ Exitosos: {debugResults.filter(r => r.success).length}
              </span>
              <span className="text-red-600">
                ❌ Fallidos: {debugResults.filter(r => !r.success).length}
              </span>
              <span className="text-gray-600">
                📊 Total: {debugResults.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex">
          <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Cómo usar este debug:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Ejecuta "Ver Estructura" para entender qué campos tiene tu tabla actual</li>
              <li>Prueba los diferentes payloads para ver cuál funciona</li>
              <li>Revisa los errores 422 para entender qué campos faltan o están mal</li>
              <li>Usa el test personalizado para probar variaciones específicas</li>
              <li>Los logs detallados aparecen en la consola del navegador (F12)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodDebugComponent;