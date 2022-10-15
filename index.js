const express = require('express');
const { default: mongoose } = require('mongoose');
const Multer = require('multer');
const FirebaseStorage = require('multer-firebase-storage');

const https = require('https');

const app = express();
const Image = require('./models/image');

const serviceAccount = {
  type: '',
  project_id: '-a',
  private_key_id: '',
  private_key:
    '-----BEGIN PRIVATE KEY-----\\//++\\/++\n+/+/++\\+jXu/\nx/\\nHt//+/++\ns/++O/\nfbh+7fXSulQgY+==\n-----END PRIVATE KEY-----\n',
  client_email: '--@-a.iam..com',
  client_id: '',
  auth_uri: 'https://.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2..com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: '',
};

const multer = Multer({
  storage: FirebaseStorage({
    bucketName: 'gs://rituparna-a.appspot.com',
    credentials: {
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
      projectId: serviceAccount.project_id,
    },
    public: true,
    unique: true,
    hooks: {
      beforeUpload(req, file) {
        console.log(`before upload:`, file);
        file.originalname = file.originalname.replace(/ /g, '_');
        file.originalname = Date.now() + '_' + file.originalname;
      },
    },
  }),
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', async (req, res, next) => {
  const images = await Image.find();
  res.render('index', {
    images,
  });
});

app.post('/upload', multer.single('image'), async (req, res, next) => {
  const image = await Image.create({
    url: req.file.fileRef.metadata.mediaLink,
  });
  res.redirect('/');
});

app.get('/image/:id', async (req, res, next) => {
  const image = await Image.findOne({ _id: req.params.id });
  if (!image) {
    return res.status(404).json({
      message: 'not found',
    });
  }
  https.get(image.url, (stream) => {
    stream.pipe(res);
  });
});

mongoose
  .connect('mongodb://localhost:27017/firebase')
  .then((result) => {
    console.log('DB Connected');
    return app.listen(3000);
  })
  .then(() => {
    console.log('app connected');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
