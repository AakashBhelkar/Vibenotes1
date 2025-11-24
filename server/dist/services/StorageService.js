"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Storage service for handling file uploads to Supabase Storage
 */
class StorageService {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        this.bucketName = process.env.SUPABASE_BUCKET_NAME || 'attachments';
        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase configuration is missing. Attachments feature will be disabled.');
            // Provide a dummy client that safely no‑ops storage calls
            this.supabase = this.createDummyClient();
        }
        else {
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        }
    }
    getClient() {
        // After construction this.supabase is always defined (real or dummy)
        return this.supabase;
    }
    /**
     * Creates a dummy Supabase client with no‑op storage methods.
     * This allows the rest of the code to run without a real Supabase instance.
     */
    createDummyClient() {
        return {
            storage: {
                from: (_bucket) => ({
                    upload: async () => ({ data: {}, error: null }),
                    getPublicUrl: () => ({ data: { publicUrl: '' } }),
                    remove: async () => ({ error: null }),
                    listBuckets: async () => ({ data: [] }),
                    createBucket: async () => ({ error: null }),
                    createSignedUrl: async () => ({ data: null, error: { message: 'Supabase not configured' } })
                })
            }
        };
    }
    /**
     * Generate a unique file path for storage
     */
    generateFilePath(userId, noteId, fileName) {
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        return `${userId}/${noteId}/${timestamp}_${sanitizedFileName}`;
    }
    /**
     * Upload a file to Supabase Storage
     * @param userId - User ID for organizing files
     * @param noteId - Note ID for organizing files
     * @param fileName - Original file name
     * @param fileBuffer - File content as Buffer
     * @param mimeType - MIME type of the file
     * @returns Object containing the file URL and path
     */
    async uploadFile(userId, noteId, fileName, fileBuffer, mimeType) {
        const client = this.getClient();
        const filePath = this.generateFilePath(userId, noteId, fileName);
        const { data, error } = await client.storage
            .from(this.bucketName)
            .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false,
        });
        if (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
        // Get public URL
        const { data: urlData } = client.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);
        return {
            url: urlData.publicUrl,
            path: filePath,
        };
    }
    /**
     * Delete a file from Supabase Storage
     * @param filePath - Path to the file in storage
     */
    async deleteFile(filePath) {
        const client = this.getClient();
        const { error } = await client.storage
            .from(this.bucketName)
            .remove([filePath]);
        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    /**
     * Get a signed URL for temporary access to a file
     * @param filePath - Path to the file in storage
     * @param expiresIn - Expiration time in seconds (default: 1 hour)
     * @returns Signed URL
     */
    async getSignedUrl(filePath, expiresIn = 3600) {
        const client = this.getClient();
        const { data, error } = await client.storage
            .from(this.bucketName)
            .createSignedUrl(filePath, expiresIn);
        if (error || !data) {
            throw new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`);
        }
        return data.signedUrl;
    }
    /**
     * Check if the storage bucket exists, create if it doesn't
     */
    async ensureBucketExists() {
        if (!this.supabase)
            return; // Skip if not configured
        const client = this.supabase;
        const { data: buckets } = await client.storage.listBuckets();
        const bucketExists = buckets?.some((bucket) => bucket.name === this.bucketName);
        if (!bucketExists) {
            const { error } = await client.storage.createBucket(this.bucketName, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
            });
            if (error) {
                throw new Error(`Failed to create storage bucket: ${error.message}`);
            }
        }
    }
}
exports.StorageService = StorageService;
