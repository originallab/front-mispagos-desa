import React from 'react';

const ProfileHeader = ({ 
  avatar = '👨‍💼', 
  name = 'Carlos Mendoza', 
  role = 'Administrador del Sistema',
  bgColor = 'bg-blue-600',
  avatarBgColor = 'bg-blue-500'
}) => {
  return (
    <div className={`${bgColor} text-white`}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center">
          <div className={`w-24 h-24 ${avatarBgColor} rounded-full mx-auto mb-4 flex items-center justify-center text-3xl`}>
            {avatar}
          </div>
          <h1 className="text-2xl font-semibold mb-1">{name}</h1>
          <p className="text-blue-100">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;