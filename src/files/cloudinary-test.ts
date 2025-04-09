import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Función para verificar configuración de Cloudinary
async function testCloudinaryConfig() {
  try {
    console.log('Credenciales encontradas:');
    console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Presente' : 'Ausente'}`);
    console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'Presente' : 'Ausente'}`);
    console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'Presente' : 'Ausente'}`);
    
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    // Obtener y mostrar la configuración actual
    const config = cloudinary.config();
    console.log('Configuración actual de Cloudinary:');
    console.log(`- Cloud Name: ${config.cloud_name}`);
    console.log(`- API Key: ${config.api_key?.substring(0, 4)}...`);
    console.log(`- API Secret: ${config.api_secret ? 'Configurado correctamente' : 'No configurado'}`);
    
    // Intentar una operación simple para verificar la conexión
    console.log('Intentando conexión con Cloudinary...');
    const result = await cloudinary.api.ping();
    console.log('Conexión exitosa:', result);
    
    return { success: true, message: 'Cloudinary configurado correctamente' };
  } catch (error) {
    console.error('Error al verificar Cloudinary:', error.message);
    return { success: false, message: `Error: ${error.message}`, error };
  }
}

// Ejecutar la prueba
testCloudinaryConfig()
  .then(result => {
    if (result.success) {
      console.log('✅ ' + result.message);
      process.exit(0);
    } else {
      console.error('❌ ' + result.message);
      process.exit(1);
    }
  });