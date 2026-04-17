// Major districts/cities across India for rain monitoring
const INDIAN_DISTRICTS = [
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },
  
  // Delhi NCR
  { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  
  // Karnataka
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { name: 'Hubli', state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  
  // Tamil Nadu — All 38 Districts
  { name: 'Ariyalur',        state: 'Tamil Nadu', lat: 11.1401, lon: 79.0786 },
  { name: 'Chengalpattu',    state: 'Tamil Nadu', lat: 12.6819, lon: 79.9888 },
  { name: 'Chennai',         state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore',      state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Cuddalore',       state: 'Tamil Nadu', lat: 11.7447, lon: 79.7680 },
  { name: 'Dharmapuri',      state: 'Tamil Nadu', lat: 12.1277, lon: 78.1579 },
  { name: 'Dindigul',        state: 'Tamil Nadu', lat: 10.3673, lon: 77.9803 },
  { name: 'Erode',           state: 'Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  { name: 'Kallakurichi',    state: 'Tamil Nadu', lat: 11.7401, lon: 78.9590 },
  { name: 'Kanchipuram',     state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036 },
  { name: 'Kanyakumari',     state: 'Tamil Nadu', lat:  8.0883, lon: 77.5385 },
  { name: 'Karur',           state: 'Tamil Nadu', lat: 10.9601, lon: 78.0766 },
  { name: 'Krishnagiri',     state: 'Tamil Nadu', lat: 12.5186, lon: 78.2137 },
  { name: 'Madurai',         state: 'Tamil Nadu', lat:  9.9252, lon: 78.1198 },
  { name: 'Mayiladuthurai',  state: 'Tamil Nadu', lat: 11.1035, lon: 79.6550 },
  { name: 'Nagapattinam',    state: 'Tamil Nadu', lat: 10.7656, lon: 79.8428 },
  { name: 'Namakkal',        state: 'Tamil Nadu', lat: 11.2194, lon: 78.1674 },
  { name: 'Nilgiris',        state: 'Tamil Nadu', lat: 11.4916, lon: 76.7337 },
  { name: 'Perambalur',      state: 'Tamil Nadu', lat: 11.2342, lon: 78.8832 },
  { name: 'Pudukkottai',     state: 'Tamil Nadu', lat: 10.3833, lon: 78.8000 },
  { name: 'Ramanathapuram',  state: 'Tamil Nadu', lat:  9.3639, lon: 78.8397 },
  { name: 'Ranipet',         state: 'Tamil Nadu', lat: 12.9273, lon: 79.3333 },
  { name: 'Salem',           state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { name: 'Sivaganga',       state: 'Tamil Nadu', lat:  9.8476, lon: 78.4800 },
  { name: 'Tenkasi',         state: 'Tamil Nadu', lat:  8.9596, lon: 77.3152 },
  { name: 'Thanjavur',       state: 'Tamil Nadu', lat: 10.7867, lon: 79.1378 },
  { name: 'Theni',           state: 'Tamil Nadu', lat: 10.0104, lon: 77.4768 },
  { name: 'Thoothukudi',     state: 'Tamil Nadu', lat:  8.7642, lon: 78.1348 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { name: 'Tirunelveli',     state: 'Tamil Nadu', lat:  8.7139, lon: 77.7567 },
  { name: 'Tirupathur',      state: 'Tamil Nadu', lat: 12.4952, lon: 78.5670 },
  { name: 'Tiruppur',        state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411 },
  { name: 'Tiruvallur',      state: 'Tamil Nadu', lat: 13.1394, lon: 79.9089 },
  { name: 'Tiruvannamalai',  state: 'Tamil Nadu', lat: 12.2253, lon: 79.0747 },
  { name: 'Tiruvarur',       state: 'Tamil Nadu', lat: 10.7720, lon: 79.6368 },
  { name: 'Vellore',         state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325 },
  { name: 'Viluppuram',      state: 'Tamil Nadu', lat: 11.9390, lon: 79.4924 },
  { name: 'Virudhunagar',    state: 'Tamil Nadu', lat:  9.5680, lon: 77.9624 },

  // Tamil Nadu — Hill Stations
  { name: 'Ooty',            state: 'Tamil Nadu', lat: 11.4064, lon: 76.6932 },
  { name: 'Coonoor',         state: 'Tamil Nadu', lat: 11.3530, lon: 76.7959 },
  { name: 'Kotagiri',        state: 'Tamil Nadu', lat: 11.4204, lon: 76.8600 },
  { name: 'Kodaikanal',      state: 'Tamil Nadu', lat: 10.2381, lon: 77.4892 },
  { name: 'Yercaud',         state: 'Tamil Nadu', lat: 11.7794, lon: 78.2090 },
  { name: 'Valparai',        state: 'Tamil Nadu', lat: 10.3269, lon: 76.9510 },
  { name: 'Kolli Hills',     state: 'Tamil Nadu', lat: 11.2483, lon: 78.3410 },
  { name: 'Kalrayan Hills',  state: 'Tamil Nadu', lat: 11.6300, lon: 78.8000 },
  { name: 'Sirumalai',       state: 'Tamil Nadu', lat: 10.1500, lon: 77.9500 },
  { name: 'Yelagiri',        state: 'Tamil Nadu', lat: 12.5736, lon: 78.6390 },
  { name: 'Meghamalai',      state: 'Tamil Nadu', lat:  9.6847, lon: 77.2470 },
  { name: 'Manjolai',        state: 'Tamil Nadu', lat:  8.7150, lon: 77.4000 },
  
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636 },
  { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lon: 87.3119 },
  
  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  
  // Telangana
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  
  // Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  
  // Kerala
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804 },
  
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
  
  // Punjab
  { name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lon: 76.7794 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
  
  // Madhya Pradesh
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  
  // Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Gaya', state: 'Bihar', lat: 24.7955, lon: 85.0002 },
  
  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
  { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8830 },
  
  // Assam
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  
  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lon: 86.2029 },
  
  // Chhattisgarh
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  
  // Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
  
  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  
  // Jammu & Kashmir
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973 },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570 },
  
  // Goa
  { name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278 },
];

module.exports = { INDIAN_DISTRICTS };
