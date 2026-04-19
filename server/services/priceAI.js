// AI-based Price Suggestion Service (Feature P)
// This service analyzes trip details and suggests optimal pricing

class PriceAIService {
  // Base rates per km for different transport modes
  static BASE_RATES = {
    car: 8,
    bike: 5,
    suv: 10,
    van: 12,
    bus: 6,
    train: 4,
    flight: 50
  };
  
  // Calculate suggested price for a trip
  static calculateSuggestedPrice(tripDetails) {
    const {
      transport,
      distance,
      maxMembers,
      departureTime,
      date,
      amenities = {},
      preferences = {},
      womenOnly = false
    } = tripDetails;
    
    // Parse distance
    const distanceKm = parseFloat(distance) || 0;
    
    // Get base rate for transport
    const baseRate = this.BASE_RATES[transport?.toLowerCase()] || this.BASE_RATES.car;
    
    // Calculate base cost
    let totalCost = baseRate * distanceKm;
    
    // Add fuel and toll estimates
    const fuelCost = this.estimateFuelCost(transport, distanceKm);
    const tollCost = this.estimateTollCost(distanceKm);
    totalCost += fuelCost + tollCost;
    
    // Apply peak hour multiplier
    const peakMultiplier = this.getPeakHourMultiplier(departureTime, date);
    totalCost *= peakMultiplier;
    
    // Apply amenities premium
    const amenitiesPremium = this.calculateAmenitiesPremium(amenities);
    totalCost += amenitiesPremium;
    
    // Apply preferences premium
    const preferencesPremium = this.calculatePreferencesPremium(preferences, womenOnly);
    totalCost += preferencesPremium;
    
    // Apply distance-based discount (longer trips = lower per km rate)
    const distanceDiscount = this.getDistanceDiscount(distanceKm);
    totalCost *= (1 - distanceDiscount);
    
    // Calculate per person cost
    const perPersonCost = Math.ceil(totalCost / (maxMembers || 1));
    
    // Calculate price range (min and max)
    const minPrice = Math.floor(perPersonCost * 0.8); // 20% below
    const maxPrice = Math.ceil(perPersonCost * 1.2); // 20% above
    
    return {
      totalCost: Math.ceil(totalCost),
      suggestedPerPersonCost: perPersonCost,
      minPrice,
      maxPrice,
      priceRange: `₹${minPrice} - ₹${maxPrice}`,
      breakdown: {
        baseFare: Math.ceil(baseRate * distanceKm),
        fuelCost: Math.ceil(fuelCost),
        tollCost: Math.ceil(tollCost),
        amenitiesPremium: Math.ceil(amenitiesPremium),
        preferencesPremium: Math.ceil(preferencesPremium),
        peakMultiplier,
        distanceDiscount
      },
      recommendations: this.generatePriceRecommendations(perPersonCost, distanceKm, maxMembers)
    };
  }
  
  // Estimate fuel cost based on transport and distance
  static estimateFuelCost(transport, distanceKm) {
    const fuelPrices = { petrol: 100, diesel: 90 }; // per liter
    const mileage = {
      car: 15, // km per liter
      bike: 40,
      suv: 10,
      van: 8,
      bus: 6
    };
    
    const vehicleMileage = mileage[transport?.toLowerCase()] || mileage.car;
    const fuelType = transport === 'bike' ? 'petrol' : 'diesel';
    
    return (distanceKm / vehicleMileage) * fuelPrices[fuelType];
  }
  
  // Estimate toll cost based on distance
  static estimateTollCost(distanceKm) {
    // Approximate toll: ₹2 per km for highways (assume 50% of trip is highway)
    if (distanceKm > 50) {
      return distanceKm * 0.5 * 2;
    }
    return 0;
  }
  
  // Get peak hour multiplier
  static getPeakHourMultiplier(departureTime, date) {
    const hour = parseInt(departureTime?.split(':')[0] || 9);
    const dayOfWeek = new Date(date).getDay();
    
    // Weekend premium
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.15;
    }
    
    // Morning peak (7-10 AM)
    if (hour >= 7 && hour <= 10) {
      return 1.2;
    }
    
    // Evening peak (5-8 PM)
    if (hour >= 17 && hour <= 20) {
      return 1.2;
    }
    
    // Night hours (10 PM - 6 AM)
    if (hour >= 22 || hour <= 6) {
      return 1.25;
    }
    
    return 1.0;
  }
  
  // Calculate amenities premium
  static calculateAmenitiesPremium(amenities) {
    let premium = 0;
    
    if (amenities.ac) premium += 50;
    if (amenities.wifi) premium += 30;
    if (amenities.bluetooth) premium += 20;
    if (amenities.charger) premium += 15;
    if (amenities.waterBottles) premium += 10;
    
    return premium;
  }
  
  // Calculate preferences premium
  static calculatePreferencesPremium(preferences, womenOnly) {
    let premium = 0;
    
    if (womenOnly) premium += 30;
    if (preferences.smoking === 'not-allowed') premium += 0; // No premium for non-smoking
    if (preferences.ac) premium += 20;
    if (preferences.luggage === 'large') premium += 25;
    
    return premium;
  }
  
  // Get distance-based discount
  static getDistanceDiscount(distanceKm) {
    if (distanceKm > 500) return 0.15; // 15% discount for very long trips
    if (distanceKm > 300) return 0.10; // 10% discount
    if (distanceKm > 150) return 0.05; // 5% discount
    return 0;
  }
  
  // Generate price recommendations
  static generatePriceRecommendations(suggestedPrice, distanceKm, maxMembers) {
    const recommendations = [];
    
    if (suggestedPrice < 100) {
      recommendations.push('Consider increasing the price slightly to cover fuel costs');
    } else if (suggestedPrice > 1000) {
      recommendations.push('High price may reduce booking interest. Consider offering group discounts');
    }
    
    if (distanceKm > 200 && maxMembers < 3) {
      recommendations.push('Increase max members to reduce per-person cost and attract more riders');
    }
    
    if (maxMembers >= 4) {
      recommendations.push('Good passenger capacity! This trip is cost-effective for riders');
    }
    
    return recommendations;
  }
  
  // Calculate dynamic pricing based on demand
  static calculateDynamicPrice(basePrice, demand) {
    // demand: object with { views, bookings, timeUntilTrip }
    const { views = 0, bookings = 0, timeUntilTrip = 24 } = demand;
    
    let multiplier = 1.0;
    
    // High demand (many views, few bookings)
    if (views > 50 && bookings < 3) {
      multiplier = 1.15;
    }
    
    // Last minute booking (less than 6 hours)
    if (timeUntilTrip < 6) {
      multiplier = 1.3;
    } else if (timeUntilTrip < 12) {
      multiplier = 1.2;
    }
    
    // Early bird discount (more than 7 days)
    if (timeUntilTrip > 168) { // 7 days in hours
      multiplier = 0.9;
    }
    
    return {
      dynamicPrice: Math.ceil(basePrice * multiplier),
      multiplier,
      reason: this.getDynamicPricingReason(multiplier)
    };
  }
  
  static getDynamicPricingReason(multiplier) {
    if (multiplier > 1.2) return 'High demand or last-minute booking';
    if (multiplier > 1.0) return 'Peak hours or increased demand';
    if (multiplier < 1.0) return 'Early bird discount';
    return 'Standard pricing';
  }
}

export default PriceAIService;
