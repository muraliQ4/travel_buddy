// Emergency SOS Service

import Emergency from '../models/Emergency.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

export class EmergencyService {
  /**
   * Trigger SOS alert
   */
  async triggerSOS(tripId, userId, type, location, description = '') {
    try {
      // Get user and trip details
      const [user, trip] = await Promise.all([
        User.findById(userId).select('name phone emergencyContacts'),
        Trip.findById(tripId).populate('creator members')
      ]);

      if (!user || !trip) {
        return { success: false, message: 'User or trip not found' };
      }

      // Create emergency record
      const emergency = new Emergency({
        trip: tripId,
        user: userId,
        userName: user.name,
        type: type,
        severity: this.determineSeverity(type),
        location: location,
        description: description,
        status: 'active'
      });

      await emergency.save();

      // Notify emergency contacts
      const notifiedContacts = await this.notifyEmergencyContacts(
        user.emergencyContacts,
        user.name,
        location,
        emergency._id
      );

      emergency.notifiedContacts = notifiedContacts;
      await emergency.save();

      // Notify all trip members
      await this.notifyTripMembers(trip, emergency);

      // Send alert to admin/support team
      await this.notifySupport(emergency);

      // If critical, auto-notify police
      if (emergency.severity === 'critical') {
        await this.notifyAuthorities(emergency, location);
      }

      return {
        success: true,
        message: 'SOS alert triggered',
        emergencyId: emergency._id,
        notifiedCount: notifiedContacts.length
      };
    } catch (error) {
      console.error('SOS trigger error:', error);
      return { success: false, message: 'Failed to trigger SOS', error: error.message };
    }
  }

  /**
   * Quick SOS trigger without trip (for general emergencies)
   */
  async triggerQuickSOS(userId, type, location, description = '') {
    try {
      console.log('🚨 Quick SOS triggered by user:', userId);
      
      // Get user details with emergency contacts
      const user = await User.findById(userId).select('name phone email emergencyContacts');

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      console.log('✅ User found:', user.name);
      console.log('📋 Emergency contacts:', user.emergencyContacts.length);

      if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
        return { 
          success: false, 
          message: 'No emergency contacts found. Please add emergency contacts first.' 
        };
      }

      // Create emergency record without trip
      const emergency = new Emergency({
        user: userId,
        userName: user.name,
        type: type || 'sos',
        severity: this.determineSeverity(type || 'sos'),
        location: location,
        description: description || 'Emergency SOS triggered - I am in trouble and need immediate help!',
        status: 'active'
      });

      await emergency.save();
      console.log('✅ Emergency record created:', emergency._id);

      // Add initial timeline event
      await this.addTimelineEvent(
        emergency._id, 
        'SOS Alert Triggered', 
        'User activated emergency SOS button', 
        'user'
      );

      // Notify emergency contacts
      const notifiedContacts = await this.notifyEmergencyContacts(
        user.emergencyContacts,
        user.name,
        location,
        emergency._id
      );

      emergency.notifiedContacts = notifiedContacts;
      await emergency.save();

      console.log('✅ Notified', notifiedContacts.length, 'contacts');

      // Send alert to admin/support team
      await this.notifySupport(emergency);

      // If critical, auto-notify police
      if (emergency.severity === 'critical') {
        await this.notifyAuthorities(emergency, location);
      }

      // Add notification event to timeline
      await this.addTimelineEvent(
        emergency._id,
        'Emergency Contacts Notified',
        `${notifiedContacts.length} contact(s) notified via SMS`,
        'system'
      );

      return {
        success: true,
        message: 'SOS alert sent to all emergency contacts',
        emergencyId: emergency._id,
        notifiedCount: notifiedContacts.length,
        contacts: notifiedContacts.map(c => ({ name: c.name, phone: c.phone }))
      };
    } catch (error) {
      console.error('❌ Quick SOS trigger error:', error);
      return { success: false, message: 'Failed to trigger SOS', error: error.message };
    }
  }

  /**
   * Determine severity based on emergency type
   */
  determineSeverity(type) {
    const severityMap = {
      'sos': 'critical',
      'panic': 'critical',
      'medical': 'high',
      'accident': 'critical',
      'harassment': 'high',
      'vehicle_breakdown': 'medium',
      'other': 'medium'
    };
    return severityMap[type] || 'medium';
  }

  /**
   * Notify emergency contacts
   */
  async notifyEmergencyContacts(contacts, userName, location, emergencyId) {
    const notified = [];

    for (const contact of contacts) {
      try {
        // In production, integrate with SMS/Call service
        console.log(`[SOS] Notifying ${contact.name} at ${contact.phone}`);
        console.log(`[SOS] ${userName} triggered an emergency alert`);
        console.log(`[SOS] Location: ${location.lat}, ${location.lon}`);
        console.log(`[SOS] View: ${process.env.APP_URL}/emergency/${emergencyId}`);

        // Send SMS (integrate with Twilio, SNS, or similar)
        await this.sendSMS(
          contact.phone,
          `EMERGENCY: ${userName} needs help! Location: https://maps.google.com/?q=${location.lat},${location.lon}. View details: ${process.env.APP_URL}/emergency/${emergencyId}`
        );

        notified.push({
          name: contact.name,
          phone: contact.phone,
          notifiedAt: new Date(),
          acknowledged: false
        });
      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
      }
    }

    return notified;
  }

  /**
   * Notify all trip members about emergency
   */
  async notifyTripMembers(trip, emergency) {
    const memberIds = [trip.creator, ...trip.members].filter(id => 
      id.toString() !== emergency.user.toString()
    );

    const notifications = memberIds.map(memberId => ({
      user: memberId,
      type: 'sos_alert',
      title: '🚨 Emergency Alert',
      message: `${emergency.userName} triggered an SOS alert during your trip!`,
      priority: 'urgent',
      data: {
        emergencyId: emergency._id,
        tripId: trip._id,
        location: emergency.location,
        type: emergency.type
      },
      relatedTrip: trip._id,
      relatedUser: emergency.user
    }));

    await Notification.insertMany(notifications);

    // Emit socket event for real-time notification
    // socketService.emit('emergency', { tripId: trip._id, emergency });
  }

  /**
   * Notify support team
   */
  async notifySupport(emergency) {
    // Send to support dashboard/admin panel
    console.log('[ADMIN ALERT] Emergency reported:', emergency);
    
    // In production, integrate with admin notification system
    // Could use Slack, email, SMS to on-call support team
  }

  /**
   * Notify authorities (police/ambulance)
   */
  async notifyAuthorities(emergency, location) {
    // In production, integrate with local emergency services API
    console.log('[POLICE NOTIFICATION]', {
      emergencyId: emergency._id,
      location: location,
      severity: emergency.severity,
      type: emergency.type
    });

    emergency.policeNotified = true;
    await emergency.save();
  }

  /**
   * Send SMS (placeholder - integrate with actual SMS service)
   */
  async sendSMS(phone, message) {
    // Integrate with Twilio, AWS SNS, or other SMS service
    console.log(`[SMS to ${phone}] ${message}`);
    
    // Example Twilio integration:
    // await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE,
    //   to: phone
    // });
  }

  /**
   * Acknowledge emergency
   */
  async acknowledgeEmergency(emergencyId, userId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    const contact = emergency.notifiedContacts.find(c => c.phone === userId);
    if (contact) {
      contact.acknowledged = true;
    }

    await emergency.save();

    return { success: true, message: 'Emergency acknowledged' };
  }

  /**
   * Resolve emergency
   */
  async resolveEmergency(emergencyId, userId, resolution) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    emergency.resolvedBy = userId;
    emergency.resolution = resolution;

    await emergency.save();

    // Notify all contacts that emergency is resolved
    await this.notifyResolution(emergency);

    return { success: true, message: 'Emergency resolved' };
  }

  /**
   * Notify resolution
   */
  async notifyResolution(emergency) {
    console.log(`[RESOLVED] Emergency ${emergency._id} has been resolved`);
    
    // Send notifications to all contacts
    for (const contact of emergency.notifiedContacts) {
      await this.sendSMS(
        contact.phone,
        `Emergency alert for ${emergency.userName} has been resolved. Status: Safe.`
      );
    }
  }

  /**
   * Start audio recording (placeholder)
   */
  async startAudioRecording(emergencyId) {
    // Integrate with audio recording service
    console.log(`[AUDIO] Recording started for emergency ${emergencyId}`);
    
    return {
      success: true,
      message: 'Audio recording started',
      recordingId: `rec_${Date.now()}`
    };
  }

  /**
   * Upload emergency photos
   */
  async uploadEmergencyPhoto(emergencyId, photoUrl) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.photos.push({
      url: photoUrl,
      uploadedAt: new Date()
    });

    await emergency.save();

    return { success: true, message: 'Photo uploaded' };
  }

  /**
   * Get active emergencies
   */
  async getActiveEmergencies() {
    const emergencies = await Emergency.find({ status: 'active' })
      .populate('user', 'name phone profilePhoto')
      .populate('trip', 'title from to')
      .sort({ createdAt: -1 });

    return { success: true, emergencies };
  }

  /**
   * Get emergency history for user
   */
  async getUserEmergencies(userId) {
    const emergencies = await Emergency.find({ user: userId })
      .populate('trip', 'title from to date')
      .sort({ createdAt: -1 });

    return { success: true, emergencies };
  }

  /**
   * Upload emergency video
   */
  async uploadEmergencyVideo(emergencyId, videoUrl, duration, thumbnail) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.video = {
      recorded: true,
      url: videoUrl,
      duration: duration,
      thumbnail: thumbnail
    };

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Video evidence uploaded', `Duration: ${duration}s`, 'user');

    return { success: true, message: 'Video uploaded successfully' };
  }

  /**
   * Start live location tracking
   */
  async startLiveTracking(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.liveTracking.active = true;
    emergency.liveTracking.startedAt = new Date();
    emergency.liveTracking.locationUpdates = [];

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Live tracking started', 'Real-time location updates enabled', 'system');

    return { success: true, message: 'Live tracking started', trackingId: emergencyId };
  }

  /**
   * Update live location
   */
  async updateLiveLocation(emergencyId, location) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency || !emergency.liveTracking.active) {
      return { success: false, message: 'Live tracking not active' };
    }

    emergency.liveTracking.locationUpdates.push({
      lat: location.lat,
      lon: location.lon,
      timestamp: new Date(),
      accuracy: location.accuracy || 0,
      speed: location.speed || 0
    });

    // Update main location
    emergency.location.lat = location.lat;
    emergency.location.lon = location.lon;
    emergency.location.lastUpdated = new Date();

    // Check geofence if enabled
    if (emergency.geofence.enabled && !emergency.geofence.breached) {
      const distance = this.calculateDistance(
        emergency.liveTracking.locationUpdates[0],
        location
      );
      
      if (distance > emergency.geofence.radius) {
        await this.reportGeofenceBreach(emergencyId, location);
      }
    }

    await emergency.save();

    return { success: true, message: 'Location updated' };
  }

  /**
   * Stop live tracking
   */
  async stopLiveTracking(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.liveTracking.active = false;
    emergency.liveTracking.endedAt = new Date();

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Live tracking stopped', `Total updates: ${emergency.liveTracking.locationUpdates.length}`, 'system');

    return { success: true, message: 'Live tracking stopped' };
  }

  /**
   * Set geofence around current location
   */
  async setGeofence(emergencyId, radius = 500) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.geofence.enabled = true;
    emergency.geofence.radius = radius;
    emergency.geofence.breached = false;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Geofence activated', `Radius: ${radius}m`, 'system');

    return { success: true, message: `Geofence set with ${radius}m radius` };
  }

  /**
   * Report geofence breach
   */
  async reportGeofenceBreach(emergencyId, location) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.geofence.breached = true;
    emergency.geofence.breachedAt = new Date();

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Geofence breached', `New location: ${location.lat}, ${location.lon}`, 'system');

    // Alert all contacts
    await this.notifyGeofenceBreach(emergency, location);

    return { success: true, message: 'Geofence breach reported' };
  }

  /**
   * Notify contacts about geofence breach
   */
  async notifyGeofenceBreach(emergency, location) {
    console.log(`[GEOFENCE BREACH] Emergency ${emergency._id}`);
    
    for (const contact of emergency.notifiedContacts) {
      await this.sendSMS(
        contact.phone,
        `ALERT: ${emergency.userName} has moved outside the safe zone! New location: https://maps.google.com/?q=${location.lat},${location.lon}`
      );
    }
  }

  /**
   * Activate panic button with countdown
   */
  async activatePanicButton(emergencyId, countdown = 10) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.panicButton.activated = true;
    emergency.panicButton.countdown = countdown;
    emergency.panicButton.cancelled = false;
    emergency.panicButton.activatedAt = new Date();

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Panic button activated', `Countdown: ${countdown}s`, 'user');

    // Schedule auto-trigger after countdown
    setTimeout(async () => {
      const updatedEmergency = await Emergency.findById(emergencyId);
      if (updatedEmergency && updatedEmergency.panicButton.activated && !updatedEmergency.panicButton.cancelled) {
        await this.triggerPanicButtonAlerts(emergencyId);
      }
    }, countdown * 1000);

    return { success: true, message: `Panic button activated with ${countdown}s countdown`, countdown };
  }

  /**
   * Cancel panic button
   */
  async cancelPanicButton(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.panicButton.cancelled = true;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Panic button cancelled', 'User cancelled in time', 'user');

    return { success: true, message: 'Panic button cancelled' };
  }

  /**
   * Trigger panic button alerts
   */
  async triggerPanicButtonAlerts(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) return;

    await this.addTimelineEvent(emergencyId, 'Panic button triggered', 'No cancellation received', 'system');
    
    // Alert all contacts
    for (const contact of emergency.notifiedContacts) {
      await this.sendSMS(
        contact.phone,
        `PANIC ALERT: ${emergency.userName} triggered panic button! Location: https://maps.google.com/?q=${emergency.location.lat},${emergency.location.lon}`
      );
    }

    // Alert authorities
    await this.notifyAuthorities(emergency, emergency.location);
  }

  /**
   * Set safe word
   */
  async setSafeWord(emergencyId, word) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.safeWord.word = word;
    emergency.safeWord.used = false;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Safe word set', 'Security feature enabled', 'user');

    return { success: true, message: 'Safe word set successfully' };
  }

  /**
   * Verify safe word
   */
  async verifySafeWord(emergencyId, word) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    const isValid = emergency.safeWord.word === word;

    if (isValid) {
      emergency.safeWord.used = true;
      emergency.safeWord.usedAt = new Date();
      emergency.status = 'resolved';
      emergency.resolvedAt = new Date();
      emergency.resolution = 'Resolved via safe word verification';

      await emergency.save();
      await this.addTimelineEvent(emergencyId, 'Safe word verified', 'Emergency resolved safely', 'user');

      return { success: true, message: 'Safe word verified - emergency resolved', valid: true };
    } else {
      await this.addTimelineEvent(emergencyId, 'Invalid safe word attempt', 'Someone tried wrong safe word', 'system');
      
      // Alert contacts about wrong safe word attempt
      for (const contact of emergency.notifiedContacts) {
        await this.sendSMS(
          contact.phone,
          `WARNING: Someone tried wrong safe word for ${emergency.userName}'s emergency! This could be a sign of danger.`
        );
      }

      return { success: false, message: 'Invalid safe word', valid: false };
    }
  }

  /**
   * Schedule fake call
   */
  async scheduleFakeCall(emergencyId, delayMinutes, callerName = 'Mom', reason = 'emergency') {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    const scheduledFor = new Date(Date.now() + delayMinutes * 60000);

    emergency.fakeCall.scheduled = true;
    emergency.fakeCall.scheduledFor = scheduledFor;
    emergency.fakeCall.executed = false;
    emergency.fakeCall.callerName = callerName;
    emergency.fakeCall.reason = reason;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Fake call scheduled', `Will ring in ${delayMinutes} minutes`, 'user');

    // Schedule the call
    setTimeout(async () => {
      await this.executeFakeCall(emergencyId);
    }, delayMinutes * 60000);

    return { success: true, message: `Fake call scheduled for ${delayMinutes} minutes`, scheduledFor };
  }

  /**
   * Execute fake call
   */
  async executeFakeCall(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.fakeCall.executed = true;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Fake call executed', `Caller: ${emergency.fakeCall.callerName}`, 'system');

    return { 
      success: true, 
      message: 'Fake call triggered',
      callerName: emergency.fakeCall.callerName,
      reason: emergency.fakeCall.reason
    };
  }

  /**
   * Setup check-in system
   */
  async setupCheckIn(emergencyId, interval = 30, autoTriggerAfter = 2) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.checkIn.required = true;
    emergency.checkIn.interval = interval;
    emergency.checkIn.lastCheckIn = new Date();
    emergency.checkIn.missedCheckIns = 0;
    emergency.checkIn.autoTriggerAfter = autoTriggerAfter;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Check-in system activated', `Interval: ${interval} minutes`, 'user');

    return { success: true, message: `Check-in required every ${interval} minutes` };
  }

  /**
   * Perform check-in
   */
  async performCheckIn(emergencyId) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.checkIn.lastCheckIn = new Date();
    emergency.checkIn.missedCheckIns = 0;

    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Check-in performed', 'User confirmed safety', 'user');

    return { success: true, message: 'Check-in recorded' };
  }

  /**
   * Check for missed check-ins (should be called by cron job)
   */
  async checkMissedCheckIns() {
    const emergencies = await Emergency.find({
      status: 'active',
      'checkIn.required': true
    });

    for (const emergency of emergencies) {
      const timeSinceLastCheckIn = Date.now() - emergency.checkIn.lastCheckIn.getTime();
      const intervalMs = emergency.checkIn.interval * 60000;

      if (timeSinceLastCheckIn > intervalMs) {
        emergency.checkIn.missedCheckIns += 1;

        if (emergency.checkIn.missedCheckIns >= emergency.checkIn.autoTriggerAfter) {
          await this.triggerMissedCheckInAlert(emergency);
        }

        await emergency.save();
      }
    }
  }

  /**
   * Trigger alert for missed check-in
   */
  async triggerMissedCheckInAlert(emergency) {
    await this.addTimelineEvent(emergency._id, 'Missed check-in alert', `Missed ${emergency.checkIn.missedCheckIns} check-ins`, 'system');

    for (const contact of emergency.notifiedContacts) {
      await this.sendSMS(
        contact.phone,
        `ALERT: ${emergency.userName} has missed ${emergency.checkIn.missedCheckIns} check-ins! Last known location: https://maps.google.com/?q=${emergency.location.lat},${emergency.location.lon}`
      );
    }
  }

  /**
   * Find nearby facilities (hospitals, police stations, safe spaces)
   */
  async findNearbyFacilities(emergencyId, location) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    // In production, integrate with Google Places API or similar
    // For now, return mock data
    const mockFacilities = {
      hospitals: [
        { name: 'City General Hospital', address: '123 Main St', distance: 1.2, phone: '102', emergencyServices: true },
        { name: 'St. Mary Medical Center', address: '456 Oak Ave', distance: 2.5, phone: '555-0102', emergencyServices: true }
      ],
      policeStations: [
        { name: 'Central Police Station', address: '789 Center St', distance: 0.8, phone: '100' },
        { name: 'North Precinct', address: '321 North Rd', distance: 3.2, phone: '555-0100' }
      ],
      safeSpaces: [
        { name: 'Grand Hotel', address: '555 Park Blvd', distance: 0.5, type: 'hotel' },
        { name: '24/7 Diner', address: '888 Highway 1', distance: 1.0, type: 'restaurant' },
        { name: 'Shell Gas Station', address: '999 Main St', distance: 0.3, type: 'gas_station' }
      ]
    };

    emergency.nearbyFacilities = mockFacilities;
    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Nearby facilities found', `${mockFacilities.hospitals.length} hospitals, ${mockFacilities.policeStations.length} police stations`, 'system');

    return { success: true, facilities: mockFacilities };
  }

  /**
   * Update medical information
   */
  async updateMedicalInfo(emergencyId, medicalInfo) {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.medicalInfo = medicalInfo;
    await emergency.save();
    await this.addTimelineEvent(emergencyId, 'Medical info updated', 'Critical health information added', 'user');

    return { success: true, message: 'Medical information updated' };
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(emergencyId, event, details, actor = 'system') {
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    emergency.incidentTimeline.push({
      timestamp: new Date(),
      event: event,
      actor: actor,
      details: details
    });

    await emergency.save();

    return { success: true, message: 'Timeline event added' };
  }

  /**
   * Get emergency details with full timeline
   */
  async getEmergencyDetails(emergencyId) {
    const emergency = await Emergency.findById(emergencyId)
      .populate('user', 'name phone profilePhoto email')
      .populate('trip', 'title from to date')
      .populate('resolvedBy', 'name');
    
    if (!emergency) {
      return { success: false, message: 'Emergency not found' };
    }

    return { 
      success: true, 
      emergency,
      timeline: emergency.incidentTimeline,
      activeFeatures: {
        liveTracking: emergency.liveTracking.active,
        geofence: emergency.geofence.enabled,
        checkIn: emergency.checkIn.required,
        panicButton: emergency.panicButton.activated,
        hasSafeWord: !!emergency.safeWord.word,
        fakeCallScheduled: emergency.fakeCall.scheduled
      }
    };
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

// Singleton instance
export const emergencyService = new EmergencyService();
