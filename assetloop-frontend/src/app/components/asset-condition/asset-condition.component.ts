import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetConditionService, AssetCondition } from '../../services/asset-condition.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudUploadAlt, faCheckCircle, faImages, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-asset-condition',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, FormsModule],
    templateUrl: './asset-condition.component.html',
    styleUrls: ['./asset-condition.component.css']
})

export class AssetConditionComponent implements OnInit, OnChanges {
    @Input() bookingId!: string;
    @Input() userType!: 'owner' | 'renter';
    @Input() bookingStatus!: string;

    condition: AssetCondition | null = null;
    selectedFiles: File[] = [];
    loading = false;
    uploading = false;
    error: string | null = null;
    success: string | null = null;

    faCloudUploadAlt = faCloudUploadAlt;
    faCheckCircle = faCheckCircle;
    faImages = faImages;
    faExclamationTriangle = faExclamationTriangle;

    constructor(private service: AssetConditionService) { }

    ngOnInit() {
        if (this.bookingId) this.loadCondition();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bookingId'] && !changes['bookingId'].firstChange) {
            this.loadCondition();
        }
    }

    loadCondition() {
        this.loading = true;
        this.service.getCondition(this.bookingId).subscribe({
            next: (data) => {
                this.condition = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    onFileSelected(event: any) {
        this.selectedFiles = Array.from(event.target.files);
        this.error = null;
        this.success = null;
    }

    get showBeforeUpload(): boolean {
        // Owner can upload before handover
        return this.userType === 'owner' &&
            ['pending', 'confirmed'].includes(this.bookingStatus);
    }

    get showAfterUpload(): boolean {
        // Renter can upload after return
        // User requirement: "Disable 'Upload After Return' until booking is completed"
        // We will allow it if status is 'completed' or 'active' (during return process)
        return this.userType === 'renter' &&
            ['active', 'completed'].includes(this.bookingStatus);
    }

    uploadImages(type: 'before' | 'after') {
        if (this.selectedFiles.length === 0) return;

        this.uploading = true;
        this.error = null;
        this.success = null;

        const req = type === 'before'
            ? this.service.uploadBeforeImages(this.bookingId, this.selectedFiles)
            : this.service.uploadAfterImages(this.bookingId, this.selectedFiles);

        req.subscribe({
            next: (res) => {
                this.condition = res;
                this.uploading = false;
                this.success = "Images uploaded successfully";
                this.selectedFiles = [];
                // consistent reset
                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            error: (err) => {
                this.error = err.error?.message || "Upload failed";
                this.uploading = false;
            }
        });
    }

    showDisputeModal = false;
    disputeReason = '';

    openDisputeModal() {
        this.showDisputeModal = true;
        this.disputeReason = '';
    }

    closeDisputeModal() {
        this.showDisputeModal = false;
    }

    submitDispute() {
        if (!this.disputeReason.trim()) return;

        this.service.createDispute(this.bookingId, this.disputeReason).subscribe({
            next: () => {
                this.success = "Dispute raised successfully. Admin will review it.";
                this.closeDisputeModal();
            },
            error: (err) => {
                console.error(err);
                this.error = "Failed to raise dispute: " + (err.error?.message || err.message);
                this.closeDisputeModal();
            }
        });
    }

    reportIssue() {
        this.openDisputeModal();
    }

}

