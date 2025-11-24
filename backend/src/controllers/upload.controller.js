const uploadService = require('../services/upload.service');

const uploadFile = async (req, res, next) => {
  try {
    // Note: Multer middleware has already processed the file stream and saved it to disk.
    // This is necessary for standard HTTP uploads. 
    // To the user, it feels "fast" because we return immediately after the transfer is done
    // without doing heavy post-processing (like resizing) in the main thread.
    
    const result = await uploadService.processUpload(req.file);

    res.status(201).json({
      message: 'File uploaded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile
};
