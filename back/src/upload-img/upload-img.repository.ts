import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadImgRepository {
  constructor() {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({ secure: true });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    const cfg = cloudinary.config();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      console.warn(
        '[Cloudinary] Faltan credenciales CLOUDINARY_* o CLOUDINARY_URL en .env',
      );
    }
  }

  upload(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder,
          overwrite: true,
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
        (err, res) => {
          if (err || !res)
            return reject(err || new Error('upload result is undefined'));
          resolve(res);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return this.upload(file, folder);
  }

  async uploadUserImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return this.upload(file, folder);
  }
}
