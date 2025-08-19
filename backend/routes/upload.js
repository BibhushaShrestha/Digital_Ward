import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${safeBase}-${Date.now()}${ext}`);
	}
});

// File filter for allowed types
const allowedMimes = new Set([
	'application/pdf',
	'image/jpeg',
	'image/png'
]);

const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: (req, file, cb) => {
		if (allowedMimes.has(file.mimetype)) return cb(null, true);
		return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
	}
});

// @desc Upload single document
// @route POST /api/upload
// @access Private
router.post('/', optionalAuth, upload.single('file'), (req, res) => {
	const file = req.file;
	if (!file) {
		return res.status(400).json({ success: false, error: 'File is required' });
	}

	// Create per-user directory so files have a stable path tied to the user
	const userId = (req.user && (req.user._id || req.user.id)) ? String(req.user._id || req.user.id) : 'anonymous';
	const userDir = path.join(uploadsDir, userId);
	if (!fs.existsSync(userDir)) {
		fs.mkdirSync(userDir, { recursive: true });
	}

	// Build a stable filename from provided name or original filename
	const providedName = (req.body?.name || '').toString().trim();
	const baseName = providedName || path.parse(file.originalname).name;
	const slugBase = (baseName || 'document')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '') || 'document';
	const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype === 'application/pdf' ? '.pdf' : '');

	let finalName = `${slugBase}${ext}`;
	let finalPath = path.join(userDir, finalName);

	// Replace existing by default; if caller sets replace=false, create a unique name
	const replaceExisting = String(req.body?.replace || 'true') === 'true';
	if (fs.existsSync(finalPath)) {
		if (!replaceExisting) {
			finalName = `${slugBase}-${Date.now()}${ext}`;
			finalPath = path.join(userDir, finalName);
		} else {
			try { fs.unlinkSync(finalPath); } catch {}
		}
	}

	// Move the uploaded file to the user directory with the stable/unique name
	try {
		fs.renameSync(path.join(uploadsDir, file.filename), finalPath);
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to save file' });
	}

	const publicUrl = `/uploads/${userId}/${finalName}`;
	return res.json({
		success: true,
		message: 'File uploaded successfully',
		data: {
			file: {
				url: publicUrl,
				filename: finalName,
				size: file.size,
				mimeType: file.mimetype,
				originalName: file.originalname
			}
		}
	});
});

// @desc Upload multiple documents
// @route POST /api/upload/multiple
// @access Private

router.post('/multiple', optionalAuth, upload.array('files', 5), (req, res) => {
	const files = req.files || [];
	if (!files.length) {
		return res.status(400).json({ success: false, error: 'No files uploaded' });
	}

	const userId = (req.user && (req.user._id || req.user.id)) ? String(req.user._id || req.user.id) : 'anonymous';
	const userDir = path.join(uploadsDir, userId);
	if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

	const items = files.map(f => {
		const safeBase = path.parse(f.originalname).name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
		const ext = path.extname(f.originalname).toLowerCase();
		let name = `${safeBase}${ext}`;
		let dest = path.join(userDir, name);
		if (fs.existsSync(dest)) {
			name = `${safeBase}-${Date.now()}${ext}`;
			dest = path.join(userDir, name);
		}
		fs.renameSync(path.join(uploadsDir, f.filename), dest);
		return {
			url: `/uploads/${userId}/${name}`,
			filename: name,
			size: f.size,
			mimeType: f.mimetype,
			originalName: f.originalname
		};
	});

	return res.json({
		success: true,
		message: 'Files uploaded successfully',
		data: { files: items }
	});
});

export default router;


