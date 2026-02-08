import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import 'multer';

@Injectable()
export class CloudinaryService {
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
            console.log('✅ Cloudinary Configured');
        } else {
            console.warn('⚠️ Cloudinary keys missing. Falling back to Mock mode.');
        }
    }

    // Renamed from 'uploadFile' to 'uploadImage'
    async uploadImage(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve) => {
            // 1. Safety Check: If no keys, use Mock immediately
            if (!this.configService.get<string>('CLOUDINARY_API_KEY')) {
                return resolve(this.getMockUrl(file.originalname));
            }

            // 2. Real Upload to Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'surplus-donations' },
                (error, result) => {
                    if (error || !result) {
                        console.error('❌ Cloudinary Upload Failed:', error?.message);
                        // Fallback to Mock URL so the app doesn't crash
                        return resolve(this.getMockUrl(file.originalname));
                    }
                    console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
                    resolve(result.secure_url);
                },
            );

            try {
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            } catch (err) {
                console.error('Stream Error:', err);
                resolve(this.getMockUrl(file.originalname));
            }
        });
    }

    // Renamed from 'uploadFiles' to 'uploadImages'
    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!files || files.length === 0) return [];
        return Promise.all(files.map(file => this.uploadImage(file)));
    }

    private getMockUrl(filename: string): string {
        return `https://placehold.co/600x400/059669/ffffff?text=${encodeURIComponent(filename)}`;
    }
}