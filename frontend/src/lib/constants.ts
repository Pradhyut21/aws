import type { IndianLanguage, Festival } from './types';

export const INDIAN_LANGUAGES: IndianLanguage[] = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'North India' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra Pradesh' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Nastaliq', region: 'Pan India' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali', region: 'Assam' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', region: 'Bihar' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', region: 'Pan India' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', script: 'Nastaliq', region: 'Kashmir' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', region: 'Sikkim' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'Nastaliq', region: 'Rajasthan' },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', region: 'Goa' },
    { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Bengali', region: 'Manipur' },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', region: 'Jharkhand' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', region: 'J&K' },
    { code: 'bodo', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', region: 'Assam' },
];

export const BUSINESS_TYPES = [
    { id: 'retail', label: 'Retail Shop', emoji: '🏪' },
    { id: 'restaurant', label: 'Restaurant / Food', emoji: '🍽️' },
    { id: 'handicraft', label: 'Handicraft / Textiles', emoji: '🧶' },
    { id: 'farmer', label: 'Farmer / Agriculture', emoji: '🌾' },
    { id: 'artist', label: 'Artist / Musician', emoji: '🎵' },
    { id: 'tech', label: 'Tech / Software', emoji: '💻' },
    { id: 'service', label: 'Service Provider', emoji: '🔧' },
    { id: 'education', label: 'Education / Coaching', emoji: '📚' },
    { id: 'health', label: 'Health / Wellness', emoji: '🏥' },
    { id: 'construction', label: 'Construction', emoji: '🏗️' },
    { id: 'other', label: 'Other', emoji: '🏢' },
];

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export const CITY_COORDINATES = [
    { name: 'Mumbai', lat: 19.076, lon: 72.877, size: 1.5 },
    { name: 'Delhi', lat: 28.614, lon: 77.209, size: 1.5 },
    { name: 'Bangalore', lat: 12.972, lon: 77.594, size: 1.2 },
    { name: 'Hyderabad', lat: 17.385, lon: 78.487, size: 1.0 },
    { name: 'Chennai', lat: 13.083, lon: 80.27, size: 1.1 },
    { name: 'Kolkata', lat: 22.572, lon: 88.364, size: 1.2 },
    { name: 'Varanasi', lat: 25.318, lon: 83.005, size: 0.8 },
    { name: 'Coimbatore', lat: 11.017, lon: 76.959, size: 0.7 },
    { name: 'Shillong', lat: 25.578, lon: 91.883, size: 0.7 },
    { name: 'Jaipur', lat: 26.912, lon: 75.787, size: 0.9 },
    { name: 'Ahmedabad', lat: 23.022, lon: 72.572, size: 1.0 },
    { name: 'Pune', lat: 18.52, lon: 73.854, size: 1.0 },
    { name: 'Lucknow', lat: 26.85, lon: 80.946, size: 0.9 },
    { name: 'Kochi', lat: 9.931, lon: 76.267, size: 0.8 },
];

export const UPCOMING_FESTIVALS: Festival[] = [
    { name: 'Holi', date: '2026-03-21', emoji: '🎨', color: '#FF6B35', description: 'Festival of Colors' },
    { name: 'Baisakhi', date: '2026-04-13', emoji: '🌾', color: '#F7C948', description: 'Harvest Festival' },
    { name: 'Eid ul-Fitr', date: '2026-03-30', emoji: '🌙', color: '#00D4FF', description: 'Festival of Breaking Fast' },
    { name: 'Ram Navami', date: '2026-03-28', emoji: '🏹', color: '#FF6B35', description: 'Birth of Lord Rama' },
    { name: 'Good Friday', date: '2026-04-03', emoji: '✝️', color: '#94A3B8', description: 'Christian Observance' },
    { name: 'Ambedkar Jayanti', date: '2026-04-14', emoji: '🫶', color: '#00FF88', description: 'Dr B.R. Ambedkar Day' },
];

export const PIPELINE_STAGES = [
    { id: 1, label: 'Research Agent', agent: 'Nova Pro', aws: 'Bedrock + Lambda', icon: '🔍', color: '#00D4FF' },
    { id: 2, label: 'Creative Swarm', agent: 'Nova Omni + Reel', aws: 'Bedrock + S3', icon: '🎨', color: '#FF6B35' },
    { id: 3, label: 'Quality Guard', agent: 'Bedrock Guardrails', aws: 'Guardrails API', icon: '🛡️', color: '#F7C948' },
    { id: 4, label: 'Distribution', agent: 'Nova Sonic', aws: 'Bedrock + DynamoDB', icon: '📡', color: '#00FF88' },
    { id: 5, label: 'Published!', agent: 'Orchestrator', aws: 'API Gateway + SNS', icon: '🎉', color: '#FF6B35' },
];

export const HERO_TAGLINES = [
    { text: 'अपना Business बढ़ाओ', lang: 'Hindi' },
    { text: 'உங்கள் வணிகத்தை வளர்க்கவும்', lang: 'Tamil' },
    { text: 'আপনার ব্যবসা বাড়ান', lang: 'Bengali' },
    { text: 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ಬೆಳೆಸಿ', lang: 'Kannada' },
    { text: 'మీ వ్యాపారాన్ని పెంచుకోండి', lang: 'Telugu' },
    { text: 'तुमचा व्यवसाय वाढवा', lang: 'Marathi' },
];

export const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', emoji: '📸', color: '#E1306C' },
    { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', color: '#25D366' },
    { id: 'facebook', name: 'Facebook', emoji: '👍', color: '#1877F2' },
    { id: 'youtube', name: 'YouTube Shorts', emoji: '▶️', color: '#FF0000' },
    { id: 'twitter', name: 'Twitter/X', emoji: '🐦', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', emoji: '💼', color: '#0A66C2' },
];
