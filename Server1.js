const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// File Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const purchaserCnic = req.body.purchaserCnic || req.query.purchaserCnic;
    if (!purchaserCnic) return cb(new Error("CNIC is missing"), null);

    const dir = path.join(__dirname, 'uploads', purchaserCnic);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle form submission
app.post('/submit', upload.array('documents'), (req, res) => {
  const formData = req.body;
  const files = req.files;
  const purchaserCnic = formData.purchaserCnic;

  const userFolder = path.join(__dirname, 'uploads', purchaserCnic);
  const isUpdate = fs.existsSync(userFolder);

  // Clear old files if folder exists
  if (isUpdate) {
    fs.readdirSync(userFolder).forEach(file => {
      const filePath = path.join(userFolder, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  } else {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  const jsonData = {
    seller: {
      name: formData.sellerName,
      cnic: formData.sellerCnic,
      father: formData.sellerFather,
      religion: formData.sellerReligion,
      address: formData.sellerAddress
    },
    purchaser: {
      name: formData.purchaserName,
      cnic: formData.purchaserCnic,
      father: formData.purchaserFather,
      religion: formData.purchaserReligion,
      address: formData.purchaserAddress
    },
    property: {
      type: formData.propertyType,
      makanType: formData.makanType || null,
      summary: formData.propertySummary,
      marketValue: formData.marketValue,
      districtValue: formData.districtValue,
      fbrValue: formData.fbrValue
    },
    uploadedFiles: files.map(file => file.filename)
  };

  fs.writeFileSync(
    path.join(userFolder, 'form-data.json'),
    JSON.stringify(jsonData, null, 2)
  );

  const pdfPath = path.join(userFolder, 'ChallanDetails.pdf');
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(18).text('Challan / Registration Details', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Seller Details', { underline: true });
  doc.fontSize(12).text(`Name: ${formData.sellerName}`);
  doc.text(`CNIC: ${formData.sellerCnic}`);
  doc.text(`Father's Name: ${formData.sellerFather}`);
  doc.text(`Religion: ${formData.sellerReligion}`);
  doc.text(`Address: ${formData.sellerAddress}`);
  doc.moveDown();

  doc.fontSize(14).text('Purchaser Details', { underline: true });
  doc.fontSize(12).text(`Name: ${formData.purchaserName}`);
  doc.text(`CNIC: ${formData.purchaserCnic}`);
  doc.text(`Father's Name: ${formData.purchaserFather}`);
  doc.text(`Religion: ${formData.purchaserReligion}`);
  doc.text(`Address: ${formData.purchaserAddress}`);
  doc.moveDown();

  doc.fontSize(14).text('Property Details', { underline: true });
  doc.fontSize(12).text(`Type: ${formData.propertyType}`);
  if (formData.makanType) {
    doc.text(`Makan Type: ${formData.makanType}`);
  }
  doc.text(`Summary: ${formData.propertySummary}`);
  doc.text(`Market Value: ${formData.marketValue}`);
  doc.text(`District Value: ${formData.districtValue}`);
  doc.text(`FBR Value: ${formData.fbrValue}`);
  doc.moveDown();

  doc.text(`Generated for CNIC: ${purchaserCnic}`, { align: 'center' });
  doc.end();

  res.send(`<h2>${isUpdate ? 'Updated' : 'Created'} File for CNIC: ${purchaserCnic}</h2><a href="/" style="text-decoration: none" >Go Back</a> &nbsp; | &nbsp;<a href="/pdf/${purchaserCnic}" target="_blank" style="text-decoration: none">Download PDF</a>`);
});


// Endpoint to serve the PDF file
app.get('/pdf/:purchaserCnic', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.purchaserCnic, 'ChallanDetails.pdf');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('PDF not found');
  }
});
app.get('/viewPDF', (req, res) => {
  const cnic = req.query.cnic;
  if (!cnic) {
    return res.status(400).send('CNIC is required');
  }

  const filePath = path.join(__dirname, 'uploads', cnic, 'ChallanDetails.pdf');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('PDF not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
