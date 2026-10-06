const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  try {
    // Listar los blobs almacenados en Vercel Blob
    const { blobs } = await list();

    // Mapeamos los blobs al formato de fotos que espera tu interfaz
    // Cada objeto tendrá la url completa y su nombre
    const photos = blobs.map((blob) => ({
      id: blob.url, // Usamos la URL como identificador único
      name: blob.pathname,
      url: blob.url,
      createdTime: blob.uploadedAt
    }));

    return res.status(200).json({ configured: true, photos });
  } catch (error) {
    console.error('Error listing blobs:', error);
    return res.status(500).json({ ok: false, message: 'Error al listar las fotos desde Vercel Blob' });
  }
};