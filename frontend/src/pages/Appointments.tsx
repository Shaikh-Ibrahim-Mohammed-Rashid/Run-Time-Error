import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, X, Check, AlertCircle, Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight, Stethoscope, Star, Navigation, Search } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';
import { GoogleMap, useLoadScript, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface NewAppointment {
  doctorName: string;
  date: string;
  time: string;
  type: string;
  notes: string;
}

interface CalendarEvent {
  id: string;
  date: Date;
  doctorName: string;
  time: string;
  type: string;
  status: string;
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Hospital {
  id: string;
  name: string;
  location: Location;
  vicinity: string;
  rating?: number;
  userRatingsTotal?: number;
  distance?: number;
  duration?: string;
}

interface GoogleEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: {
      method: string;
      minutes: number;
    }[];
  };
}

const STORAGE_KEY = 'scheduled_appointments';

const saveAppointmentsToStorage = (appointments: Appointment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

const getAppointmentsFromStorage = (): Appointment[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const calculateDistance = (
  origin: Location,
  destination: Location
): Promise<{ distance: string; duration: string }> => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const result = response.rows[0].elements[0];
          resolve({
            distance: result.distance.text,
            duration: result.duration.text,
          });
        } else {
          reject(new Error('Failed to calculate distance'));
        }
      }
    );
  });
};

const DAYS_OF_WEEK = [
  { key: 'sun', label: 'Sun' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' }
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const Appointments = () => {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointmentsFromStorage());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    doctorName: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });
  // const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    vicinity: string;
    rating?: number;
    userRatingsTotal?: number;
  }>>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState(nearbyHospitals);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  });

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      });
      if (response.results[0]) {
        return response.results[0].formatted_address;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Error getting address';
    }
  };

  // Enhanced location fetching
  const fetchUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const address = await getAddressFromCoordinates(location.lat, location.lng);
      setLocationAddress(address);
      setSelectedLocation(location);
      setUserLocation(location);
      return location;
    } catch (error: any) {
      const errorMessage = error.code === 1 
        ? 'Location access denied. Please enable location services.'
        : 'Error getting location. Please try again.';
      setLocationError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Enhanced hospital fetching
  const fetchNearbyHospitals = async (location: Location) => {
    if (!isLoaded) return;
    setIsLoadingHospitals(true);

    try {
      const service = new google.maps.places.PlacesService(
        new google.maps.Map(document.createElement('div'))
      );

      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        type: 'hospital',
        keyword: 'hospital medical center clinic'
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error('No hospitals found'));
          }
        });
      });

      const hospitalsWithDistance = await Promise.all(
        results.map(async (place) => {
          const hospital: Hospital = {
            id: place.place_id || String(Math.random()),
            name: place.name || 'Unknown Hospital',
            location: {
              lat: place.geometry?.location?.lat() || location.lat,
              lng: place.geometry?.location?.lng() || location.lng
            },
            vicinity: place.vicinity || 'Address unavailable',
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total
          };

          try {
            const { distance, duration } = await calculateDistance(
              location,
              hospital.location
            );
            return { ...hospital, distance, duration };
          } catch (error) {
            return hospital;
          }
        })
      );

      setHospitals(hospitalsWithDistance);
      setNearbyHospitals(hospitalsWithDistance);
      setFilteredHospitals(hospitalsWithDistance);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch nearby hospitals');
      setMapError('Failed to fetch nearby hospitals');
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  // Initialize location and hospitals
  useEffect(() => {
    if (isLoaded) {
      fetchUserLocation().then((location) => {
        if (location) {
          fetchNearbyHospitals(location);
        }
      });
    }
  }, [isLoaded]);

  // Enhanced getDirections function
  const getDirections = async (hospital: Hospital) => {
    if (!userLocation) return;
    setIsCalculatingRoute(true);

    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: new google.maps.LatLng(hospital.location.lat, hospital.location.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
      setSelectedHospital(hospital);
      toast.success('Route calculated successfully');
    } catch (error) {
      console.error('Error getting directions:', error);
      toast.error('Could not calculate directions');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Add this section in your JSX where you render the map
  const renderLocationInfo = () => (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Your Location</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {locationAddress || 'Fetching address...'}
          </p>
        </div>
        <button
          onClick={() => fetchUserLocation().then(location => {
            if (location) fetchNearbyHospitals(location);
          })}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Update your hospital list rendering to include distance and duration
  const renderHospitalItem = (hospital: Hospital) => (
    <motion.div
      key={hospital.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg transition-all duration-200 cursor-pointer
        ${selectedHospital?.id === hospital.id 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white hover:bg-gray-50 border-gray-200'}
        border shadow-sm hover:shadow-md`}
      onClick={() => getDirections(hospital)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{hospital.name}</h3>
        {hospital.rating && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-green-700">
              {hospital.rating} ({hospital.userRatingsTotal})
            </span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">{hospital.vicinity}</p>
      {hospital.distance && hospital.duration && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <Navigation className="w-4 h-4" />
          <span>{hospital.distance}</span>
          <span>•</span>
          <Clock className="w-4 h-4" />
          <span>{hospital.duration}</span>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
        {selectedHospital?.id === hospital.id ? (
          <>
            <MapPin className="w-4 h-4" />
            <span>Route shown on map</span>
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" />
            <span>Get directions</span>
          </>
        )}
      </div>
    </motion.div>
  );

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/${user?.id}`);
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const addToGoogleCalendar = async (appointment: Appointment) => {
    try {
      // Load the Google API client
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });

      // Initialize the Google API client
      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve);
      });

      // Initialize the client with your credentials
      await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events'
      });

      // Check if user is signed in
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if (!isSignedIn) {
        await gapi.auth2.getAuthInstance().signIn();
      }

      const startDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      // Create Google Calendar URL with prefilled data
      const calendarUrl = new URL('https://calendar.google.com/calendar/render');
      calendarUrl.searchParams.append('action', 'TEMPLATE');
      calendarUrl.searchParams.append('text', `Medical Appointment with Dr. ${appointment.doctorName}`);
      calendarUrl.searchParams.append('details', `
        Type: ${appointment.type}
        Notes: ${appointment.notes || 'No additional notes'}
        
        This appointment was scheduled through HealthMate.
      `);
      calendarUrl.searchParams.append('dates', `${startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`);
      calendarUrl.searchParams.append('ctz', Intl.DateTimeFormat().resolvedOptions().timeZone);

      // Add reminders
      const reminders = [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 60 } // 1 hour before
      ];
      calendarUrl.searchParams.append('reminders', JSON.stringify(reminders));

      // Open Google Calendar in a new tab
      window.open(calendarUrl.toString(), '_blank');
      
      toast.success('Redirecting to Google Calendar...');
    } catch (error: any) {
      console.error('Error adding to Google Calendar:', error);
      if (error.error === 'popup_blocked_by_browser') {
        toast.error('Please allow popups to add to Google Calendar');
      } else {
        toast.error('Failed to add appointment to Google Calendar');
      }
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.doctorName || !newAppointment.date || !newAppointment.time || !newAppointment.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const appointmentData: Appointment = {
        id: Date.now().toString(),
        patientName: user?.fullName || '',
        ...newAppointment,
        status: 'scheduled'
      };

      // Update state and storage
      const updatedAppointments = [...appointments, appointmentData];
      setAppointments(updatedAppointments);
      saveAppointmentsToStorage(updatedAppointments);

      // Add to Google Calendar
      await addToGoogleCalendar(appointmentData);

      setIsModalOpen(false);
      setNewAppointment({
        doctorName: '',
        date: '',
        time: '',
        type: '',
        notes: ''
      });
      
      toast.success('Appointment scheduled successfully');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const updatedAppointments = appointments.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      );
      setAppointments(updatedAppointments);
      saveAppointmentsToStorage(updatedAppointments);
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMap = () => {
    if (loadError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">Error loading Google Maps</p>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMap
        zoom={13}
        center={userLocation || { lat: 20.5937, lng: 78.9629 }}
        mapContainerClassName="w-full h-full rounded-lg"
        options={{
          styles: [], // Remove dark styles for default light theme
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
        }}
      >
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }}
          />
        )}
        
        {nearbyHospitals.map((hospital) => (
          <MarkerF
            key={hospital.id}
            position={hospital.location}
            title={hospital.name}
            onClick={() => getDirections(hospital)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/hospital.png"
            }}
          />
        ))}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    );
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = monthStart.getDay();

  const hasEventOnDay = (date: Date) => {
    return appointments.some(appointment => isSameDay(new Date(appointment.date), date));
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        // Only show appointments that are:
        // 1. In the future or today
        // 2. Have 'scheduled' status
        return (
          (aptDate >= new Date(now.setHours(0, 0, 0, 0))) && 
          apt.status === 'scheduled'
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Add this effect to filter hospitals
  useEffect(() => {
    const filtered = nearbyHospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.vicinity.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHospitals(filtered);
  }, [searchQuery, nearbyHospitals]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Appointments
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Schedule and manage your medical appointments
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Schedule Appointment</span>
          </motion.button>
        </div>

        {/* Map and Hospitals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Hospitals</h2>
              {renderLocationInfo()}
              <div className="h-[600px] rounded-lg overflow-hidden">
                {locationError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center p-4">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-gray-600">{locationError}</p>
                    </div>
                  </div>
                ) : (
                  renderMap()
                )}
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hospitals..."
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[532px] pr-2 space-y-3 custom-scrollbar">
                {isLoadingHospitals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading hospitals...</p>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hospitals found</p>
                  </div>
                ) : (
                  filteredHospitals.map(hospital => renderHospitalItem(hospital))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Calendar View</h2>
          </div>
          <AppointmentCalendar events={appointments.map(appointment => ({
            id: appointment.id,
            date: new Date(appointment.date),
            doctorName: appointment.doctorName,
            time: appointment.time,
            type: appointment.type,
            status: appointment.status
          }))} onDateSelect={(date) => setSelectedDate(date.toISOString())} />
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Appointments
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your next scheduled appointments
              </p>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 
              dark:bg-blue-900/30 px-3 py-1 rounded-full font-medium">
              {getUpcomingAppointments().length} upcoming
            </span>
          </div>
          
          <div className="space-y-4">
            {getUpcomingAppointments().length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming appointments scheduled
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Schedule your first appointment →
                </button>
              </div>
            ) : (
              getUpcomingAppointments().map((appointment) => (
                <motion.div
                key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 
                    bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 
                    dark:border-gray-600 hover:border-blue-100 dark:hover:border-blue-900/30 
                    transition-colors"
              >
                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Dr. {appointment.doctorName}
                    </h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} at {appointment.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {appointment.type}
                          </p>
                        </div>
                    {appointment.notes && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.notes}
                            </p>
                          </div>
                    )}
                  </div>
                </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${getStatusColor(appointment.status)}`}
                    >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="px-3 py-1 text-red-600 hover:text-red-700 text-sm font-medium 
                        hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Create Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Schedule New Appointment
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Doctor's Name *
                  </label>
                  <input
                    type="text"
                    value={newAppointment.doctorName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Appointment Type *
                  </label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Lab Test">Lab Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg h-24 resize-none"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                    dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-colors"
                >
                  Schedule Appointment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppointmentCalendar = ({ events, onDateSelect }: { 
  events: CalendarEvent[],
  onDateSelect: (date: Date) => void 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = monthStart.getDay();

  const hasEventOnDay = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 
                dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div 
              key={day.key} 
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}
          
          {daysInMonth.map(date => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const hasEvents = hasEventOnDay(date);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => {
                  setSelectedDate(date);
                  onDateSelect(date);
                }}
                className={`h-10 rounded-lg flex flex-col items-center justify-center relative
                  ${isSelected ? 'bg-blue-500 text-white' : 
                    isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 
                    'hover:bg-gray-50 dark:hover:bg-gray-700'}
                  ${hasEvents ? 'font-medium' : 'font-normal'}
                `}
              >
                <span className="text-sm">{format(date, 'd')}</span>
                {hasEvents && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5
                    ${isSelected ? 'bg-white' : 'bg-blue-500'}`} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for selected date */}
      {selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
          <div className="space-y-2">
            {events
              .filter(event => isSameDay(new Date(event.date), selectedDate))
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 
                    dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.doctorName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.time} - {event.type}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add this CSS to your global styles or component
const styles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #E5E7EB transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #E5E7EB;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #D1D5DB;
  }
`;

// Add type declaration for gapi
declare global {
  interface Window {
    gapi: any;
  }
}

export default Appointments; 