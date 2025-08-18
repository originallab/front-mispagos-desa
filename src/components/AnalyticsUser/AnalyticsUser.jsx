import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const AnalyticsUser = () => {
  // Datos para "Usuarios por Mes y Apps"
  const monthlyUsersData = [
    {
      month: 'Enero 2024',
      Administradores: 2.5,
      'Admin Principal': 1,
      Cliente: 1
    },
    {
      month: 'Febrero 2024',
      Administradores: 0,
      'Admin Principal': 2.5,
      Cliente: 1.2
    },
    {
      month: 'Marzo 2024',
      Administradores: 1.2,
      'Admin Principal': 0,
      Cliente: 1.3
    }
  ];



  // Datos para "Distribución por Roles"
  const roleDistributionData = [
    { name: 'Administrador', value: 35, color: '#dc3545' },
    { name: 'Admin Principal', value: 40, color: '#0d6efd' },
    { name: 'Cliente', value: 25, color: '#198754' }
  ];

  const COLORS = {
    'Administradores': '#dc3545',
    'Admin Principal': '#0d6efd',
    'Cliente': '#198754'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            {`Valor: ${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        
        {/* Gráfico de Usuarios por Mes y Apps */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <h3 className="text-lg font-medium text-gray-800">Usuarios por Mes y Apps</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[0, 3]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Administradores" fill={COLORS.Administradores} />
              <Bar dataKey="Admin Principal" fill={COLORS['Admin Principal']} />
              <Bar dataKey="Cliente" fill={COLORS.Cliente} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribución por Roles */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <h3 className="text-lg font-medium text-gray-800">Distribución por Roles</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '14px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>


        
      </div>
    </div>
  );
};

export default AnalyticsUser;