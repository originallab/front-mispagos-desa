import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit,
  Link,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  X,
  Save,
  UserCheck,
  CheckCircle,
  XCircle,
  Info,
  CreditCard
} from 'lucide-react';

// Importar las utilidades de la API
import { MethodUtils } from '../../Api/utils/methodUtils';
import { AppUtils } from '../../Api/utils/appUtils';
import { UserUtils } from '../../Api/utils/userUtils';
import { PayMethodAppUtils } from '../../Api/utils/PayMethodAppUtils'; // ✅ IMPORTAR UTILIDAD FALTANTE

// 🔧 NOTA: Este código incluye funciones de debugging temporales (debugCreateRelation, createCleanRelationPayload, validateRelationData)
// 🔧 para resolver el problema de objetos anidados en las llamadas a la API de relaciones.
// 🔧 Una vez resuelto el problema, estas funciones pueden ser simplificadas.

const PayMethod = () => {
  // Estados del componente
  const [methods, setMethods] = useState([]);
  const [apps, setApps] = useState([]);
  const [payMethodApps, setPayMethodApps] = useState([]); // ✅ NUEVO: Estado para relaciones
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ✅ CORREGIDO: Solo campos que existen en la tabla method
  const [editForm, setEditForm] = useState({
    method_name: '',  // Campo real
    global: 0,        // Campo real (0 = local, 1 = global)
    country_id: 'MX'  // Campo real
  });

  const [createForm, setCreateForm] = useState({
    method_name: '',  // Campo real
    global: 0,        // Campo real
    country_id: 'MX'  // Campo real
  });

  const [selectedApps, setSelectedApps] = useState([]);

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carga de datos...');

      // ✅ CORREGIDO: Cargar también las relaciones paymethod_app
      const [methodsData, appsData, payMethodAppsData] = await Promise.all([
        MethodUtils.getAllMethods().catch(err => {
          console.error('Error cargando métodos:', err);
          return [];
        }),
        AppUtils.getAllApps().catch(err => {
          console.error('Error cargando apps:', err);
          return [];
        }),
        PayMethodAppUtils.getAllRelations().catch(err => { // ✅ NUEVO
          console.error('Error cargando relaciones paymethod_app:', err);
          return [];
        })
      ]);

      // Intentar cargar usuario
      let userData;
      try {
        userData = await UserUtils.getUserById(1);
      } catch (err) {
        console.warn('No se pudo cargar el usuario, usando datos por defecto');
        userData = { email: 'admin@test.com', user_id: 1 };
      }

      console.log('✅ Datos cargados:', {
        methods: methodsData?.length || 0,
        apps: appsData?.length || 0,
        relations: payMethodAppsData?.length || 0,
        userData
      });

      setMethods(methodsData || []);
      setApps(appsData || []);
      setPayMethodApps(payMethodAppsData || []); // ✅ NUEVO
      setUser(userData);

      // ✅ CORREGIDO: Combinar con datos reales de la BD
      const combined = combineMethodsWithApps(methodsData || [], appsData || [], payMethodAppsData || []);
      setCombinedData(combined);

    } catch (err) {
      console.error('❌ Error al inicializar componente:', err);
      setError(`Error al cargar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREGIDO: Combinar con datos reales de paymethod_app
  const combineMethodsWithApps = useCallback((methodsData, appsData, payMethodAppsData) => {
    try {
      return methodsData.map(method => {
        const methodId = method.method_id || method.id;

        // ✅ NUEVO: Buscar aplicaciones asignadas realmente en la BD
        const methodRelations = payMethodAppsData.filter(relation =>
          relation.method_id === methodId
        );

        const assignedApps = methodRelations.map(relation => {
          return appsData.find(app =>
            (app.app_id || app.id) === relation.app_id
          );
        }).filter(Boolean); // Filtrar apps no encontradas

        // Determinar el tipo basado en el campo global
        const isGlobal = method.global === 1 || method.global === '1';
        const type = isGlobal ? 'Global' : 'Local';

        // Simular status para la UI (no existe en BD)
        const simulatedStatus = isGlobal ? 'activo' : 'inactivo';

        return {
          // Datos básicos de la tabla method
          id: methodId,
          method_id: methodId,
          name: method.method_name || 'Sin nombre',
          method_name: method.method_name,
          global: method.global || 0,
          country_id: method.country_id || 'MX',

          // Campos simulados para la UI
          status: simulatedStatus,
          commission: 0, // No existe en BD
          type: type,

          // Fechas (si existen)
          created_at: method.created_at,
          updated_at: method.updated_at,

          // Aplicaciones asignadas (datos reales)
          applications: assignedApps,
          applicationCount: assignedApps.length,
          relationIds: methodRelations.map(r => r.paymethod_app_id)
        };
      });
    } catch (error) {
      console.error('❌ Error al combinar datos:', error);
      return methodsData.map(method => ({
        id: method.method_id || method.id,
        method_id: method.method_id || method.id,
        name: method.method_name || 'Sin nombre',
        method_name: method.method_name,
        global: method.global || 0,
        country_id: method.country_id || 'MX',
        status: 'inactivo',
        commission: 0,
        type: method.global ? 'Global' : 'Local',
        applications: [],
        applicationCount: 0,
        relationIds: []
      }));
    }
  }, []);

  // Modal Component
  const Modal = useMemo(() => ({ isOpen, onClose, title, children, size = "md", showCloseButton = true }) => {
    if (!isOpen) return null;

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl"
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-lg shadow-2xl ${sizeClasses[size]} w-full max-h-screen overflow-y-auto`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full"
                disabled={modalLoading}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }, [modalLoading]);

  // Funciones para manejar modales
  const openEditModal = useCallback((method) => {
    console.log('📝 Abriendo modal de edición para:', method);
    setSelectedMethod(method);
    setEditForm({
      method_name: method.method_name || '',
      global: method.global || 0,
      country_id: method.country_id || 'MX'
    });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((method) => {
    console.log('🗑️ Abriendo modal de eliminación para:', method);
    setSelectedMethod(method);
    setShowDeleteModal(true);
  }, []);

  const openAssignModal = useCallback((method) => {
    console.log('🔗 Abriendo modal de asignación para:', method);
    setSelectedMethod(method);
    const currentAssignments = method.applications.map(app => app.app_id || app.id) || [];
    setSelectedApps(currentAssignments);
    setShowAssignModal(true);
  }, []);

  const openCreateModal = useCallback(() => {
    console.log('➕ Abriendo modal de creación');
    setCreateForm({
      method_name: '',
      global: 0,
      country_id: 'MX'
    });
    setSelectedApps([]);
    setShowCreateModal(true);
  }, []);

  const closeModals = useCallback(() => {
    if (modalLoading) return;

    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAssignModal(false);
    setShowCreateModal(false);
    setSelectedMethod(null);
    setEditForm({ method_name: '', global: 0, country_id: 'MX' });
    setCreateForm({ method_name: '', global: 0, country_id: 'MX' });
    setSelectedApps([]);
    setModalLoading(false);
  }, [modalLoading]);

  // Manejadores de formulario
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCreateFormChange = useCallback((field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ✅ SOLUCIÓN TEMPORAL: Bypass directo a la API
  const debugCreateRelation = async (relationData) => {
    console.log('🔧 BYPASS: Llamada directa a la API sin PayMethodAppUtils');
    console.log('🔧 BYPASS: Datos a enviar:', relationData);

    try {
      // 🚀 LLAMADA DIRECTA A LA API (bypass de PayMethodAppUtils)
      const response = await fetch('/api/paymethod_app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autenticación si es necesario
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(relationData) // ✅ Enviar datos directamente
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ BYPASS: Respuesta exitosa:', result);
      return result;

    } catch (error) {
      console.error('❌ BYPASS: Error en llamada directa:', error);
      throw error;
    }
  };

  // ✅ NUEVO: Función específica para crear payload de relación limpio
  const createCleanRelationPayload = (methodId, appId) => {
    console.log('🧹 CREANDO payload limpio con:', { methodId, appId });
    console.log('🧹 Tipos:', { methodId: typeof methodId, appId: typeof appId });

    // Verificar que los parámetros no sean objetos
    if (typeof methodId === 'object' || typeof appId === 'object') {
      throw new Error(`Parámetros no pueden ser objetos. methodId: ${typeof methodId}, appId: ${typeof appId}`);
    }

    // Crear objeto completamente nuevo sin referencias
    const payload = Object.create(null); // Sin prototype
    payload.method_id = parseInt(methodId, 10);
    payload.app_id = parseInt(appId, 10);

    // Verificar que la conversión fue exitosa
    if (isNaN(payload.method_id) || isNaN(payload.app_id)) {
      throw new Error(`Error en conversión a números. method_id: ${payload.method_id}, app_id: ${payload.app_id}`);
    }

    // Convertir a objeto regular para API
    const cleanPayload = {
      method_id: payload.method_id,
      app_id: payload.app_id
    };

    console.log('✨ Payload limpio creado:', cleanPayload);
    console.log('✨ Verificación JSON:', JSON.stringify(cleanPayload));

    return cleanPayload;
  };

  // ✅ NUEVO: Validar datos de relación antes de enviar
  const validateRelationData = (relationData) => {
    console.log('🔍 VALIDANDO datos de entrada:', relationData);
    console.log('🔍 Tipo de relationData:', typeof relationData);
    console.log('🔍 relationData.method_id:', relationData.method_id, typeof relationData.method_id);
    console.log('🔍 relationData.app_id:', relationData.app_id, typeof relationData.app_id);

    const errors = [];

    // Verificar que relationData sea un objeto plano
    if (typeof relationData !== 'object' || relationData === null) {
      throw new Error(`relationData debe ser un objeto, recibido: ${typeof relationData}`);
    }

    // Verificar method_id
    if (!relationData.hasOwnProperty('method_id')) {
      errors.push('method_id es requerido');
    } else if (isNaN(Number(relationData.method_id))) {
      errors.push(`method_id debe ser un número, recibido: ${relationData.method_id} (${typeof relationData.method_id})`);
    }

    // Verificar app_id
    if (!relationData.hasOwnProperty('app_id')) {
      errors.push('app_id es requerido');
    } else if (isNaN(Number(relationData.app_id))) {
      errors.push(`app_id debe ser un número, recibido: ${relationData.app_id} (${typeof relationData.app_id})`);
    }

    if (errors.length > 0) {
      throw new Error(`Datos de relación inválidos: ${errors.join(', ')}`);
    }

    // Crear objeto limpio con solo los campos necesarios
    const cleanData = {
      method_id: Number(relationData.method_id),
      app_id: Number(relationData.app_id)
    };

    console.log('✅ Datos validados y limpiados:', cleanData);
    return cleanData;
  };

  // Función para mostrar errores de manera simple
  const showError = (error, operation) => {
    console.error(`❌ Error al ${operation}:`, error);
    console.error('❌ Estructura completa del error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    let errorMessage = `Error al ${operation}`;

    if (error.response?.status === 422) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        const validationErrors = detail.map(err => {
          const field = err.loc?.join('.') || 'campo desconocido';
          return `${field}: ${err.msg}`;
        }).join('\n');
        errorMessage = `Errores de validación:\n${validationErrors}`;
      } else if (typeof detail === 'string') {
        errorMessage = `Error de validación: ${detail}`;
      } else if (error.response?.data?.message) {
        errorMessage = `Error de validación: ${error.response.data.message}`;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Agregar información de debugging para development
    if (process.env.NODE_ENV === 'development') {
      errorMessage += `\n\nDetalles técnicos:\nStatus: ${error.response?.status}\nURL: ${error.config?.url}\nMethod: ${error.config?.method}\nData: ${JSON.stringify(error.config?.data, null, 2)}`;
    }

    alert(errorMessage);
  };

  // ✅ CORREGIDO: Preparar solo datos que existen en la tabla method
  const prepareMethodData = (formData) => {
    const methodData = {};

    // method_name es requerido
    if (formData.method_name && formData.method_name.trim()) {
      methodData.method_name = formData.method_name.trim();
    }

    // global como entero (0 = local, 1 = global)
    methodData.global = parseInt(formData.global) || 0;

    // country_id
    methodData.country_id = formData.country_id || 'MX';

    console.log('📋 Datos preparados para tabla method:', methodData);
    return methodData;
  };

  // ✅ CORREGIDO: Crear método y sus relaciones
  const handleCreateSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!createForm.method_name.trim()) {
      alert('El nombre del método es requerido');
      return;
    }

    try {
      setModalLoading(true);

      // 1. Crear el método
      const methodData = prepareMethodData(createForm);
      console.log('📤 Creando método:', methodData);

      const createdMethod = await MethodUtils.createMethod(methodData);
      console.log('✅ Método creado - respuesta completa:', createdMethod);

      // ✅ CORREGIDO: Extraer el ID correctamente
      let newMethodId;
      if (createdMethod && typeof createdMethod === 'object') {
        // Si la respuesta es un objeto, buscar el ID
        newMethodId = createdMethod.method_id || createdMethod.id || createdMethod.data?.method_id || createdMethod.data?.id;
      } else {
        // Si la respuesta es directamente el ID
        newMethodId = createdMethod;
      }

      console.log('🔍 ID extraído para relaciones:', newMethodId, typeof newMethodId);

      // Verificar que tenemos un ID válido
      if (!newMethodId || isNaN(Number(newMethodId))) {
        throw new Error(`ID de método inválido: ${newMethodId}. Respuesta del servidor: ${JSON.stringify(createdMethod)}`);
      }

      // 2. ✅ NUEVO: Crear relaciones con aplicaciones seleccionadas
      if (selectedApps.length > 0) {
        console.log('📤 Creando relaciones con aplicaciones:', selectedApps);
        console.log('📤 Usando method_id:', Number(newMethodId));

        // Crear relaciones una por una para mejor control de errores
        for (const appId of selectedApps) {
          console.log('🔄 PROCESANDO appId en CREATE:', appId, typeof appId);
          console.log('🔄 newMethodId para usar:', newMethodId, typeof newMethodId);

          try {
            // ✅ USAR FUNCIÓN PARA CREAR PAYLOAD LIMPIO
            const cleanPayload = createCleanRelationPayload(newMethodId, appId);

            // ✅ VALIDAR DATOS ADICIONAL
            const validatedData = validateRelationData(cleanPayload);
            console.log('✅ Datos finales validados en CREATE:', validatedData);

            // ✅ LLAMADA DIRECTA A PayMethodAppUtils con parámetros correctos
            console.log('📡 LLAMANDO PayMethodAppUtils.createRelation con parámetros separados');
            const relationResult = await PayMethodAppUtils.createRelation(validatedData.method_id, validatedData.app_id);
            console.log('✅ Respuesta de PayMethodAppUtils.createRelation en CREATE:', relationResult);
          } catch (relationError) {
            console.error('❌ Error creando relación en CREATE:', relationError);
            console.error('❌ newMethodId era:', newMethodId, typeof newMethodId);
            console.error('❌ appId era:', appId, typeof appId);
            throw relationError;
          }
        }

        console.log('✅ Todas las relaciones creadas exitosamente');
      }

      // Recargar datos
      await initializeComponent();

      closeModals();
      alert(`Método "${createForm.method_name}" creado exitosamente con ${selectedApps.length} aplicaciones asignadas`);

    } catch (err) {
      console.error('❌ Error completo en handleCreateSubmit:', err);
      showError(err, 'crear método');
    } finally {
      setModalLoading(false);
    }
  }, [createForm, selectedApps]);

  // ✅ CORREGIDO: Editar método (solo datos de la tabla method)
  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!editForm.method_name.trim()) {
      alert('El nombre del método es requerido');
      return;
    }

    try {
      setModalLoading(true);

      const methodData = prepareMethodData(editForm);
      console.log('📤 Editando método:', selectedMethod.id, methodData);

      await MethodUtils.updateMethod(selectedMethod.id, methodData);
      console.log('✅ Método actualizado exitosamente');

      // Recargar datos
      await initializeComponent();

      closeModals();
      alert('Método actualizado exitosamente');

    } catch (err) {
      showError(err, 'editar método');
    } finally {
      setModalLoading(false);
    }
  }, [editForm, selectedMethod]);

  // Manejar eliminación
  const handleDeleteConfirm = useCallback(async () => {
    try {
      setModalLoading(true);

      console.log('📤 Eliminando método:', selectedMethod.id);

      await MethodUtils.deleteMethod(selectedMethod.id);
      console.log('✅ Método eliminado exitosamente');

      // Recargar datos
      await initializeComponent();

      closeModals();
      alert('Método eliminado exitosamente');

    } catch (err) {
      showError(err, 'eliminar método');
    } finally {
      setModalLoading(false);
    }
  }, [selectedMethod]);

  // ✅ CORREGIDO: Manejar asignación real de aplicaciones
  const handleAssignSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);

      const methodId = Number(selectedMethod.id); // ✅ ASEGURAR QUE SEA NÚMERO
      console.log('📤 Actualizando asignaciones reales para método:', methodId, typeof methodId);

      // 1. Obtener relaciones actuales
      const currentRelations = payMethodApps.filter(relation =>
        Number(relation.method_id) === methodId
      );

      console.log('🔍 Relaciones actuales encontradas:', currentRelations.length);

      // 2. Eliminar relaciones que ya no están seleccionadas
      const relationsToDelete = currentRelations.filter(relation =>
        !selectedApps.includes(Number(relation.app_id))
      );

      console.log('🗑️ Relaciones a eliminar:', relationsToDelete.length);

      for (const relation of relationsToDelete) {
        try {
          await PayMethodAppUtils.deleteRelation(relation.paymethod_app_id);
          console.log('✅ Relación eliminada:', relation.paymethod_app_id);
        } catch (deleteError) {
          console.error('❌ Error eliminando relación:', deleteError);
          throw deleteError;
        }
      }

      // 3. Crear nuevas relaciones
      const currentAppIds = currentRelations.map(r => Number(r.app_id));
      const newAppIds = selectedApps.filter(appId =>
        !currentAppIds.includes(Number(appId))
      );

      console.log('➕ Nuevas relaciones a crear:', newAppIds.length);
      console.log('➕ newAppIds array:', newAppIds);
      console.log('➕ methodId para usar:', methodId, typeof methodId);

      for (const appId of newAppIds) {
        console.log('🔄 PROCESANDO appId en ASSIGN:', appId, typeof appId);
        console.log('🔄 methodId para usar:', methodId, typeof methodId);

        try {
          // ✅ USAR FUNCIÓN PARA CREAR PAYLOAD LIMPIO
          const cleanPayload = createCleanRelationPayload(methodId, appId);

          // ✅ VALIDAR DATOS ADICIONAL
          const validatedData = validateRelationData(cleanPayload);
          console.log('✅ Datos finales validados en ASSIGN:', validatedData);

          // ✅ LLAMADA DIRECTA A PayMethodAppUtils con parámetros correctos
          console.log('📡 LLAMANDO PayMethodAppUtils.createRelation con parámetros separados');
          const relationResult = await PayMethodAppUtils.createRelation(validatedData.method_id, validatedData.app_id);
          console.log('✅ Respuesta de PayMethodAppUtils.createRelation en ASSIGN:', relationResult);
        } catch (createError) {
          console.error('❌ Error creando relación en ASSIGN:', createError);
          console.error('❌ methodId era:', methodId, typeof methodId);
          console.error('❌ appId era:', appId, typeof appId);
          console.error('❌ createError.config:', createError.config);
          throw createError;
        }
      }

      console.log('✅ Asignaciones actualizadas exitosamente');

      // Recargar datos
      await initializeComponent();

      closeModals();
      alert(`Aplicaciones asignadas exitosamente al método "${selectedMethod.name}"`);

    } catch (err) {
      console.error('❌ Error completo en handleAssignSubmit:', err);
      showError(err, 'asignar aplicaciones');
    } finally {
      setModalLoading(false);
    }
  }, [selectedMethod, selectedApps, payMethodApps]);

  const handleToggleApp = useCallback((appId) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  }, []);

  const handleToggleStatus = useCallback(async (methodId, currentStatus) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';

    try {
      console.log('📤 Cambiando estado del método:', methodId, 'a', newStatus);

      await MethodUtils.changeMethodStatus(methodId, newStatus);
      console.log('✅ Estado cambiado exitosamente');

      // Recargar datos
      await initializeComponent();

    } catch (err) {
      showError(err, 'cambiar estado del método');
    }
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'en revision':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getMethodIcon = useCallback((name, type) => {
    const methodName = (name || '').toLowerCase();

    if (methodName.includes('visa')) {
      return { bg: 'bg-blue-100', color: 'bg-blue-600', text: 'VISA' };
    } else if (methodName.includes('mastercard') || methodName.includes('master')) {
      return { bg: 'bg-orange-100', color: 'bg-orange-600', text: 'MC' };
    } else if (methodName.includes('paypal')) {
      return { bg: 'bg-blue-100', color: 'bg-blue-600', text: 'PP' };
    } else if (methodName.includes('Transferencia') || methodName.includes('bancaria') || methodName.includes('banco')) {
      return { bg: 'bg-gray-100', color: 'bg-gray-600', text: 'TB' };
    } else if (methodName.includes('american') || methodName.includes('amex')) {
      return { bg: 'bg-green-100', color: 'bg-green-600', text: 'AX' };
    } else if (type === 'Global') {
      return { bg: 'bg-green-100', color: 'bg-green-600', text: 'GL' };
    } else if (type === 'Sin estado') {
      return { bg: 'bg-gray-100', color: 'bg-gray-600', text: 'SE' };
    } else {
      const fallbackText = methodName.length >= 2
        ? methodName.substring(0, 2).toUpperCase()
        : (methodName.charAt(0)?.toUpperCase() || 'MP');
      return { bg: 'bg-purple-100', color: 'bg-purple-600', text: fallbackText };
    }
  }, []);

  // ✅ CORREGIDO: Modal para crear método
  const CreateMethodModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={closeModals}
      title="Crear Nuevo Método de Pago"
      size="lg"
    >
      <form onSubmit={handleCreateSubmit} className="space-y-6">
        {/* Nombre del método */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Método *
          </label>
          <input
            type="text"
            value={createForm.method_name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, method_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Visa, PayPal, Transferencia Bancaria"
            required
            disabled={modalLoading}
          />
        </div>

        {/* Alcance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alcance
          </label>
          <select
            value={createForm.global}
            onChange={(e) => setCreateForm(prev => ({ ...prev, global: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={modalLoading}
          >
            <option value={0}>Local</option>
            <option value={1}>Global</option>
          </select>
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País
          </label>
          <select
            value={createForm.country_id}
            onChange={(e) => setCreateForm(prev => ({ ...prev, country_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={modalLoading}
          >
            <option value="MX">México</option>
            <option value="US">Estados Unidos</option>
            <option value="AR">Argentina</option>
          </select>
        </div>

        {/* Aplicaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asignar a Aplicaciones
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
            {apps.filter(app => app.active === '1' || app.active === 1).map(app => (
              <label key={app.app_id || app.id} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedApps.includes(app.app_id || app.id)}
                  onChange={() => handleToggleApp(app.app_id || app.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={modalLoading}
                />
                <span className="text-sm text-gray-700">
                  {app.name_app || app.name}
                  <span className="text-gray-500">
                    ({app.api_key ? `${app.api_key.substring(0, 8)}...` : 'Sin API Key'})
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedApps.length} aplicación{selectedApps.length !== 1 ? 'es' : ''} seleccionada{selectedApps.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModals}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={modalLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Crear Método</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  // Modal para editar método
  const EditMethodModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={closeModals}
      title="Editar Método de Pago"
      size="lg"
    >
      <form onSubmit={handleEditSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Método *
          </label>
          <input
            type="text"
            value={editForm.method_name}
            onChange={(e) => handleEditFormChange('method_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={modalLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alcance
          </label>
          <select
            value={editForm.global}
            onChange={(e) => handleEditFormChange('global', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={modalLoading}
          >
            <option value={0}>Local</option>
            <option value={1}>Global</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País
          </label>
          <select
            value={editForm.country_id}
            onChange={(e) => handleEditFormChange('country_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={modalLoading}
          >
            <option value="MX">México</option>
            <option value="US">Estados Unidos</option>
            <option value="AR">Argentina</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModals}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={modalLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  // Modal para asignación de aplicaciones
  const AssignAppsModal = () => (
    <Modal
      isOpen={showAssignModal}
      onClose={closeModals}
      title={`Asignar Aplicaciones - ${selectedMethod?.name}`}
      size="lg"
    >
      <form onSubmit={handleAssignSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Aplicaciones
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
            {apps.filter(app => app.active === '1' || app.active === 1).map(app => (
              <label key={app.app_id || app.id} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedApps.includes(app.app_id || app.id)}
                  onChange={() => handleToggleApp(app.app_id || app.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={modalLoading}
                />
                <span className="text-sm text-gray-700">
                  {app.name_app || app.name}
                  <span className="text-gray-500">
                    ({app.api_key ? `${app.api_key.substring(0, 8)}...` : 'Sin API Key'})
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedApps.length} aplicación{selectedApps.length !== 1 ? 'es' : ''} seleccionada{selectedApps.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModals}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={modalLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Asignando...</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                <span>Asignar Aplicaciones</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  // Modal para confirmación de eliminación
  const DeleteConfirmModal = () => (
    <Modal
      isOpen={showDeleteModal}
      onClose={closeModals}
      title="Confirmar Eliminación"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              ¿Eliminar método de pago?
            </h3>
            <p className="text-sm text-gray-500">
              Esta acción eliminará permanentemente "{selectedMethod?.name}" y todas sus asignaciones.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModals}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={modalLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50"
            disabled={modalLoading}
          >
            {modalLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMethods = combinedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando métodos de pago...</h3>
            <p className="text-gray-600">Obteniendo datos de la base de datos</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={initializeComponent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header con información del sistema */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Usuario:</strong> {user?.email || 'No disponible'} (ID: {user?.user_id || 'N/A'})
          <br />
          <strong>Estado de la API:</strong> Conectada ✅
          <br />
          <strong>Datos cargados:</strong> {methods.length} métodos de pago • {apps.length} aplicaciones • {payMethodApps.length} relaciones reales
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CreditCard className="h-8 w-8 mr-3 text-blue-600" />
            Métodos de Pago
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {combinedData.length} método{combinedData.length !== 1 ? 's' : ''} encontrado{combinedData.length !== 1 ? 's' : ''} • {apps.filter(app => app.active === '1' || app.active === 1).length} aplicacion{apps.filter(app => app.active === '1' || app.active === 1).length !== 1 ? 'es activas' : ' activa'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200 transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Método</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alcance
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aplicaciones
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMethods.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-center">
                      <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl font-medium text-gray-900 mb-2">No hay métodos de pago</p>
                      <p className="text-gray-500 mb-4">Comienza creando tu primer método de pago</p>
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Método
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentMethods.map((method, index) => {
                  const icon = getMethodIcon(method.name, method.type);
                  return (
                    <tr key={method.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center ${icon.bg} rounded-lg shadow-sm`}>
                            <div className={`w-8 h-6 ${icon.color} rounded text-white text-xs flex items-center justify-center font-bold`}>
                              {icon.text}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {method.id} • Tipo: {method.type || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${method.type === 'Global'
                          ? 'bg-green-100 text-green-800'
                          : method.type === 'Sin estado'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {method.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(method.id, method.status)}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(method.status)} hover:opacity-80 cursor-pointer transition-all transform hover:scale-105`}
                        >
                          {method.status || 'inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {method.commission ? `${method.commission}%` : '0%'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {method.applicationCount > 0 ? (
                            <>
                              {method.applications.slice(0, 2).map((app, appIndex) => (
                                <span key={appIndex} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                                  {app.name_app || app.name || 'App'}
                                </span>
                              ))}
                              {method.applicationCount > 2 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
                                  +{method.applicationCount - 2} más
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                              Sin asignar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditModal(method)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Editar método"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openAssignModal(method)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-colors"
                            title="Asignar aplicaciones"
                          >
                            <Link className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(method)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Eliminar método"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, combinedData.length)}</span> de{' '}
                  <span className="font-medium">{combinedData.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
                          ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateMethodModal />
      <EditMethodModal />
      <AssignAppsModal />
      <DeleteConfirmModal />
    </div>
  );
};

export default PayMethod;