import React from 'react';

const AppCharts = () => {
  // Datos para Ingresos Mensuales (en miles)
  const ingresosData = [
    { mes: 'Ene', valor: 85, label: '85,000' },
    { mes: 'Feb', valor: 92, label: '92,000' },
    { mes: 'Mar', valor: 88, label: '88,000' },
    { mes: 'Abr', valor: 105, label: '105,000' },
    { mes: 'May', valor: 115, label: '115,000' },
    { mes: 'Jun', valor: 128, label: '128,000' },
    { mes: 'Jul', valor: 142, label: '142,000' },
    { mes: 'Ago', valor: 138, label: '138,000' },
    { mes: 'Sep', valor: 155, label: '155,000' },
    { mes: 'Oct', valor: 162, label: '162,000' },
    { mes: 'Nov', valor: 148, label: '148,000' },
    { mes: 'Dic', valor: 175, label: '175,000' }
  ];

  // Datos para Crecimiento de Usuarios
  const usuariosData = [
    { mes: 'Ene', valor: 3200, label: '3,200' },
    { mes: 'Feb', valor: 3800, label: '3,800' },
    { mes: 'Mar', valor: 4200, label: '4,200' },
    { mes: 'Abr', valor: 4800, label: '4,800' },
    { mes: 'May', valor: 5200, label: '5,200' },
    { mes: 'Jun', valor: 5800, label: '5,800' },
    { mes: 'Jul', valor: 6400, label: '6,400' },
    { mes: 'Ago', valor: 7200, label: '7,200' },
    { mes: 'Sep', valor: 7800, label: '7,800' },
    { mes: 'Oct', valor: 8200, label: '8,200' },
    { mes: 'Nov', valor: 8800, label: '8,800' },
    { mes: 'Dic', valor: 9200, label: '9,200' }
  ];

  const maxIngresos = Math.max(...ingresosData.map(d => d.valor));
  const maxUsuarios = Math.max(...usuariosData.map(d => d.valor));

  const BarChart = ({ title, data, maxValue, color, year, period }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-800 font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <span className="text-sm text-gray-600">{year}</span>
          {period && <span className="text-xs text-gray-500">{period}</span>}
        </div>
      </div>
      
      <div className="flex items-end justify-between h-48 mb-4 gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className={`w-full ${color.replace('bg-', 'bg-')} rounded-t hover:opacity-80 transition-opacity cursor-pointer`}
                style={{ height: `${(item.valor / maxValue) * 100}%` }}
                title={`${item.mes}: ${item.label}`}
              ></div>
            </div>
            <span className="text-xs text-gray-600 mt-2 font-medium">{item.mes}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-8">
      <div className="flex flex-wrap gap-8 justify-center items-start">
        <BarChart
          title="Ingresos Mensuales"
          data={ingresosData}
          maxValue={maxIngresos}
          color="bg-blue-500"
          year="2024"
        />
        
        <BarChart
          title="Crecimiento de Usuarios"
          data={usuariosData}
          maxValue={maxUsuarios}
          color="bg-green-500"
          year="Últimos 12 meses"
        />
      </div>
    </div>
  );
};

export default AppCharts;