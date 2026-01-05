import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AssetCondition {
    _id?: string;
    booking: string;
    beforeImages: { url: string; uploadedAt: Date }[];
    afterImages: { url: string; uploadedAt: Date }[];
    beforeConditionUploadedBy?: any;
    afterConditionUploadedBy?: any;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class AssetConditionService {
    private apiUrl = `${environment.apiBaseUrl}`; // Assuming environment.apiUrl is base URL e.g. http://localhost:5000/api

    constructor(private http: HttpClient) { }

    getCondition(bookingId: string): Observable<AssetCondition> {
        return this.http.get<AssetCondition>(`${this.apiUrl}/booking/${bookingId}/asset-condition`);
    }

    uploadBeforeImages(bookingId: string, images: File[]): Observable<AssetCondition> {
        const formData = new FormData();
        formData.append('bookingId', bookingId);
        images.forEach(image => formData.append('images', image));
        return this.http.post<AssetCondition>(`${this.apiUrl}/upload-before-images`, formData);
    }

    uploadAfterImages(bookingId: string, images: File[]): Observable<AssetCondition> {
        const formData = new FormData();
        formData.append('bookingId', bookingId);
        images.forEach(image => formData.append('images', image));
        return this.http.post<AssetCondition>(`${this.apiUrl}/upload-after-images`, formData);
    }

    createDispute(bookingId: string, reason: string): Observable<any> {
        // apiUrl is base URL. Disputes are at /api/disputes
        const baseUrl = this.apiUrl.replace('/api', ''); // Hacky if not careful, but environment usually has base.
        // Actually environment.apiBaseUrl is .../api
        // My previous fix set apiUrl = environment.apiBaseUrl.
        // So this.apiUrl is .../api
        return this.http.post(`${this.apiUrl}/disputes`, { bookingId, reason });
    }
}

