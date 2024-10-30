import multer from "multer";
import path from "path";
import fs from "fs";
import e from "express";

const submissionStorage = multer.diskStorage({
  destination: async (req, _file, cb) =>{
    const { assignmentId } = req.params;
    const uploadPath = path.join(__dirname, "..", "..", "app", "uploads", assignmentId);

    await fs.promises.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: async (req, file, cb) => {
    if (!req.submissionInfo) {
      cb(new Error("Missing submission information"), "");
      return;
    }
    const userId = req.submissionInfo.zid; 

    const filename = userId + "-" + Date.now() + path.extname(file.originalname);
	  cb(null, filename);
  }
});

const submissionFilter = async (
  _req: e.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): Promise<void> => {
  if (file.mimetype === "application/gzip" || file.originalname.endsWith(".tar.gz")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only .tar.gz files are allowed."));
  }
};

export const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: submissionFilter,
}).single("submission");


