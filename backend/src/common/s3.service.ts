import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import 'multer'; // Fixes Express.Multer.File type definition

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const key = `donations/${fileName}`;

            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    // ACL: 'public-read', // Uncomment if you want public access and bucket permissions allow it
                }),
            );

            return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new InternalServerErrorException('Failed to upload image to S3');
        }
    }

    async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
        return Promise.all(files.map(file => this.uploadFile(file)));
    }
}
