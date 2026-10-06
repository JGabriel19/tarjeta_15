const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  try {
    const uploadId = req.headers['x-upload-id'] || Date.now();
    const filename = `recuerdo_${uploadId}.jpg`;

    // Subir directamente el stream/buffer a Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
    });

    // Devolvemos el resultado (blob.url contiene el enlace directo a la imagen)
    return res.status(200).json({ 
      ok: true, 
      fileId: blob.url, // Mantenemos la estructura para que api/album.js no falle
      url: blob.url 
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ ok: false, message: error.message || 'No se pudo guardar la foto.' });
  }
};