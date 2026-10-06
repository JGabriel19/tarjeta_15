const { google } = require('googleapis');
const { Readable } = require('stream');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!folderId || !clientEmail || !privateKey) {
    return res.status(500).json({ ok: false, message: 'El servidor no está configurado.' });
  }

  try {
    const uploadId = req.headers['x-upload-id'] || Date.now();
    const contentType = req.headers['content-type'] || 'image/jpeg';
    
    // Recopilar los chunks del body de la petición
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await drive.files.create({
      resource: { name: `recuerdo_${uploadId}.jpg`, parents: [folderId] },
      media: { mimeType: contentType, body: stream },
      fields: 'id',
    });

    return res.status(200).json({ ok: true, fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo guardar la foto.' });
  }
};