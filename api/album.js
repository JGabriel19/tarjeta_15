const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!folderId || !clientEmail || !privateKey) {
    return res.status(200).json({ configured: false, photos: [] });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    const photos = response.data.files.map(file => ({ id: file.id, name: file.name }));
    return res.status(200).json({ configured: true, photos });
  } catch (error) {
    console.error('Error listing photos:', error);
    return res.status(500).json({ ok: false, message: 'Error al conectar con Google Drive' });
  }
};