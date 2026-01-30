import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';

@Injectable()
export class DonationsService {
  private donations: any[] = [];

  create(createDonationDto: CreateDonationDto) {
    const donation = {
      id: Date.now().toString(),
      foodType: createDonationDto.foodType,
      quantity: createDonationDto.quantity,
      unit: createDonationDto.unit,
      preparationTime: createDonationDto.preparationTime,
      location: {
        latitude: createDonationDto.latitude,
        longitude: createDonationDto.longitude,
        address: createDonationDto.address,
      },
      imageUrl: createDonationDto.imageUrl,
      specialInstructions: createDonationDto.specialInstructions,
      status: 'AVAILABLE',
      donor: {
        id: 'mock-donor-id',
        name: 'Mock Donor',
        trustScore: 4.5,
      },
      createdAt: new Date(),
    };

    this.donations.push(donation);

    return {
      success: true,
      data: donation,
      message: 'Donation created successfully',
    };
  }

  findAll(latitude?: number, longitude?: number, radius: number = 5) {
    let availableDonations = this.donations.filter(
      d => d.status === 'AVAILABLE'
    );

    // Simple distance calculation (mock - in real app use PostGIS)
    if (latitude && longitude) {
      availableDonations = availableDonations.map(donation => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          donation.location.latitude,
          donation.location.longitude,
        );
        
        return { ...donation, distance };
      }).filter(d => d.distance <= radius);
    }

    // Sort by newest first
    availableDonations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      data: availableDonations,
      message: 'Food listings retrieved successfully',
    };
  }

  claim(id: string, claimDto: ClaimDonationDto) {
    const donation = this.donations.find(d => d.id === id);

    if (!donation) {
      throw new NotFoundException({
        success: false,
        message: 'Donation not found',
        statusCode: 404,
      });
    }

    if (donation.status === 'CLAIMED') {
      throw new BadRequestException({
        success: false,
        message: 'This donation has already been claimed',
        errors: ['Food status is CLAIMED. Cannot claim again.'],
        statusCode: 400,
      });
    }

    donation.status = 'CLAIMED';
    donation.claimedAt = new Date();
    donation.estimatedPickupTime = claimDto.estimatedPickupTime;
    donation.claimedBy = {
      id: 'mock-ngo-id',
      name: 'Mock NGO',
      contactNumber: '+919876543210',
    };

    return {
      success: true,
      data: donation,
      message: 'Food donation claimed successfully',
    };
  }

  // Simple distance calculation (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}