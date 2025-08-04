import React, { useEffect, useState } from 'react';
import { MethodCounter } from '../../Api/utils/methodCount';
import { 
  CreditCard, 
  Grid3X3, 
  Users, 
  ArrowRightLeft 
} from 'lucide-react';

const Dashboard = () => {
  const [methodCount, setMethodCount] = useState(0);
  const [activeAppsCount, setActiveAppsCount] = useState(0);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0); // ✅ Nuevo estado

  useEffect(() => {
    const fetchMethodCount = async () => {
      try {
        const count = await MethodCounter.countAllMethods();
        setMethodCount(count);
      } catch (error) {
        console.error('Error al obtener el total de métodos de pago:', error);
      }
    };

    const fetchActiveAppsCount = async () => {
      try {
        const count = await MethodCounter.countActiveApps();
        setActiveAppsCount(count);
      } catch (error) {
        console.error('Error al obtener el total de aplicaciones activas:', error);
      }
    };

    const fetchRegisteredUsersCount = async () => {
      try {
        const count = await MethodCounter.countRegisteredUsers(); // ✅ Usar método correcto
        setRegisteredUsersCount(count);
      } catch (error) {
        console.error('Error al obtener el total de usuarios registrados:', error);
      }
    };

    fetchMethodCount();
    fetchActiveAppsCount();
    fetchRegisteredUsersCount(); // ✅ Llamada nueva
  }, []);

  return (
    <div className="mb-8">
      <div className="flex gap-6 overflow-x-auto pb-2 pt-15">
        {/* Total Métodos de Pago */}
        <div className="min-w-[250px] bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Métodos de Pago</p>
              <h3 className="text-2xl font-bold text-gray-800">{methodCount}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Aplicaciones Activas */}
        <div className="min-w-[250px] bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Aplicaciones Activas</p>
              <h3 className="text-2xl font-bold text-gray-800">{activeAppsCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Grid3X3 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Usuarios Registrados */}
        <div className="min-w-[250px] bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Usuarios Registrados</p>
              <h3 className="text-2xl font-bold text-gray-800">{registeredUsersCount}</h3> {/* ✅ Corrección aquí */}
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Transacciones Hoy */}
        <div className="min-w-[250px] bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Transacciones Hoy</p>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <ArrowRightLeft className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
