import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AssetConditionComponent } from '../../../components/asset-condition/asset-condition.component';
import { OwnerService } from '../../../services/owner.service';
import { Booking } from '../../../interfaces/bookings';
import { HeaderComponent } from '../../../components/header/header.component';
import { OwnerSideBarComponent } from '../owner-side-bar/owner-side-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-booking-condition',
    standalone: true,
    imports: [
        CommonModule,
        AssetConditionComponent,
        HeaderComponent,
        OwnerSideBarComponent,
        RouterModule,
        FontAwesomeModule
    ],
    templateUrl: './booking-condition.component.html',
    styleUrls: ['./booking-condition.component.css']
})

export class BookingConditionComponent implements OnInit {
    bookingId: string | null = null;
    booking: any | null = null; // Use any to match loosely with populated data
    loading = false;
    error: string | null = null;
    faArrowLeft = faArrowLeft;

    constructor(
        private route: ActivatedRoute,
        private ownerService: OwnerService
    ) { }

    ngOnInit() {
        this.bookingId = this.route.snapshot.paramMap.get('id');
        if (this.bookingId) {
            this.loadBooking();
        }
    }

    loadBooking() {
        this.loading = true;
        this.ownerService.getBookingDetails(this.bookingId!).subscribe({
            next: (res) => {
                this.booking = res;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.error = "Failed to load booking details";
                this.loading = false;
            }
        });
    }
}
