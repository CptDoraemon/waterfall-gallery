const express = require('express');
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
//
const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));
//
const cors = require('cors');
app.use(cors());
//

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.post('/upload', upload.array('file', 20), (req, res) => {
    console.log(new Date());
    res.send('success');
});

const port = process.env.PORT || 5000;
app.listen(port);