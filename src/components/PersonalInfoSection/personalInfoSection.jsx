import React from 'react';

const PersonalInfoSection = ({ 
  personalInfo = {
    fullName: 'Carlos Mendoza García',
    email: 'carlos.mendoza@empresa.com',
    phone: '+52 55 1234 5678',
    department: 'Tecnología'
  },
  onEdit = () => console.log('Edit clicked'),
  editable = true 
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Información Personal</h2>
        {editable && (
          <button 
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Editar
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
            <p className="text-gray-900">{personalInfo.fullName}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <p className="text-gray-900">{personalInfo.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
            <p className="text-gray-900">{personalInfo.phone}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Departamento</label>
            <p className="text-gray-900">{personalInfo.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;