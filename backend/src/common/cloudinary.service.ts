import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import 'multer';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly isMockMode: boolean;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isMockMode = false;
      this.logger.log('✅ Cloudinary Configured');
    } else {
      this.isMockMode = true;
      console.warn('⚠️ Cloudinary keys missing. Falling back to Mock mode.');
    }
  }

  get mockMode(): boolean {
    return this.isMockMode;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (this.isMockMode) {
      this.logger.warn(
        `Mock upload for "${file.originalname}" — Cloudinary not configured`,
      );
      return this.getMockUrl(file.originalname);
    }

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'surplus-donations' },
        (error, result) => {
          if (error || !result) {
            this.logger.error(`❌ Cloudinary upload failed: ${error?.message}`);
            return resolve(this.getMockUrl(file.originalname));
          }
          this.logger.log(`✅ Uploaded: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      try {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (err) {
        this.logger.error(`Stream error: ${err}`);
        resolve(this.getMockUrl(file.originalname));
      }
    });
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }

  private getMockUrl(filename: string): string {
    return `https://placehold.co/600x400/059669/ffffff?text=${encodeURIComponent(filename)}`;
  }
}
