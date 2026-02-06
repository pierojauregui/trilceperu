// Script para debuggear localStorage desde la consola del navegador

console.log('🔍 Debuggeando localStorage...');

// Verificar token
const token = localStorage.getItem('token');
console.log('🔑 Token:', token ? 'Existe' : 'No existe');
if (token) {
  console.log('📄 Token completo:', token);
}

// Verificar usuario
const userString = localStorage.getItem('user');
console.log('👤 Usuario string:', userString);

if (userString) {
  try {
    const user = JSON.parse(userString);
    console.log('✅ Usuario parseado exitosamente:', user);
    console.log('🆔 usuario_id:', user.usuario_id);
    console.log('📧 correo:', user.correo_electronico);
    console.log('👥 rol:', user.rol);
  } catch (error) {
    console.error('❌ Error al parsear usuario:', error);
  }
} else {
  console.log('❌ No hay datos de usuario en localStorage');
}

// Verificar todas las claves en localStorage
console.log('📋 Todas las claves en localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`- ${key}:`, value);
}