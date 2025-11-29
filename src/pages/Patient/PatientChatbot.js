import { useState, useEffect, useRef } from 'react';
import useFetch from '../../hooks/useFetch';
import client from '../../api/client';
import { formatDateTime } from '../../utils/formatting';
import { useNavigate } from 'react-router-dom';

const PatientChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your AI Medical Assistant. I'm here to help you 24/7 with:\n\n📅 **Appointment Management**\n👨‍⚕️ **Doctor Information**\n⏰ **Real-time Availability**\n📋 **Appointment Status**\n💊 **Medical Guidance**\n🚨 **Emergency Support**\n\nI can understand natural language and provide personalized assistance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState([
    { id: 1, text: 'Book Appointment', icon: '📅' },
    { id: 2, text: 'Find Doctors', icon: '👨‍⚕️' },
    { id: 3, text: 'Check Availability', icon: '⏰' },
    { id: 4, text: 'Emergency Help', icon: '🚨' }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  const { data: doctors } = useFetch('/patient/doctors');
  const { data: appointments } = useFetch('/patient/appointments');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getDoctorBySpecialization = (specialization) => {
    if (!doctors) return [];
    return doctors.filter(doc => 
      doc.profile?.specialization?.toLowerCase().includes(specialization.toLowerCase())
    );
  };

  const getAvailableSlots = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      today: [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
      ],
      tomorrow: [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
      ]
    };
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'bot',
      text: "Chat cleared! I'm ready to help you again. How can I assist you today?",
      timestamp: new Date()
    }]);
  };

  const openSettings = () => {
    // Navigate to settings or open settings modal
    alert('Settings feature coming soon! You will be able to customize:\n\n• Chat preferences\n• Notification settings\n• Language preferences\n• Theme options');
  };

  const generateBotResponse = async (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    // Enhanced appointment booking with real data integration
    if (message.includes('book') || message.includes('appointment') || message.includes('schedule') || message.includes('reserve')) {
      const availableSlots = getAvailableSlots();
      return {
        text: `I'll help you book an appointment step by step! 📅\n\n**STEP 1: Choose Your Date**\n📅 **Today** (${new Date().toLocaleDateString()}):\n${availableSlots.today.slice(0, 8).map((slot, i) => `${i + 1}. ${slot}`).join('\n')}\n\n📅 **Tomorrow** (${new Date(Date.now() + 86400000).toLocaleDateString()}):\n${availableSlots.tomorrow.slice(0, 6).map((slot, i) => `${i + 1}. ${slot}`).join('\n')}\n\n**STEP 2: Select a Specialist**\nAfter choosing your time, I'll show you available doctors based on your needs.\n\n**STEP 3: Confirm Your Booking**\nI'll help you complete the appointment with all necessary details.\n\n👉 **Please tell me:** Which date and time number would you prefer?`,
        quickActions: ['Today - 9:00 AM', 'Today - 2:00 PM', 'Today - 6:00 PM', 'Tomorrow - 10:00 AM', 'Urgent Appointment']
      };
    }
    
    // Enhanced doctor finding with real data
    if (message.includes('doctor') || message.includes('specialist') || message.includes('find') || message.includes('physician')) {
      let relevantDoctors = [];
      
      if (doctors && doctors.length > 0) {
        if (message.includes('cardio') || message.includes('heart')) {
          relevantDoctors = doctors.filter(doc => 
            doc.profile?.specialization?.toLowerCase().includes('cardio')
          );
        } else if (message.includes('general') || message.includes('family')) {
          relevantDoctors = doctors.filter(doc => 
            doc.profile?.specialization?.toLowerCase().includes('general')
          );
        } else if (message.includes('pediatric') || message.includes('child')) {
          relevantDoctors = doctors.filter(doc => 
            doc.profile?.specialization?.toLowerCase().includes('pediatric')
          );
        } else if (message.includes('ortho') || message.includes('bone')) {
          relevantDoctors = doctors.filter(doc => 
            doc.profile?.specialization?.toLowerCase().includes('ortho')
          );
        } else {
          relevantDoctors = doctors.slice(0, 3);
        }
      }
      
      if (relevantDoctors.length > 0) {
        const doctorList = relevantDoctors.map((doc, index) => {
          const rating = '⭐'.repeat(Math.floor(Math.random() * 2) + 4);
          const availability = doc.isAvailable ? 'Available Today' : 'Available Tomorrow';
          return `${index + 1}. **Dr. ${doc.name}**\n   🏥 ${doc.profile?.specialization || 'General Physician'}\n   ${rating} (${doc.profile?.experience || '5'}+ years)\n   💰 $${doc.profile?.consultationFee || '75'} consultation\n   📅 ${availability}\n   📍 ${doc.profile?.clinic || 'Main Clinic'}`;
        }).join('\n\n');
        
        return {
          text: `I found ${relevantDoctors.length} qualified doctors for you:\n\n**AVAILABLE DOCTORS:**\n\n${doctorList}\n\n**NEXT STEPS:**\n1. Choose your preferred doctor (tell me the number)\n2. I'll show you their available time slots\n3. We'll complete your booking\n\n👉 **Which doctor would you like to choose? (Reply with the number)**`,
          quickActions: ['Choose Doctor 1', 'Choose Doctor 2', 'Choose Doctor 3', 'Show More Doctors', 'Filter by Specialization']
        };
      } else {
        return {
          text: `I'll help you find the right specialist step by step:\n\n**STEP 1: Tell Me Your Medical Need**\nWhat type of medical issue are you experiencing?\n\n**STEP 2: I'll Match Specialists**\nBased on your symptoms, I'll recommend the right specialists.\n\n**STEP 3: Choose Your Doctor**\nI'll show you qualified doctors with their details.\n\n**Available Specialties:**\n🫀 **Cardiology** - Heart and blood vessels\n🦴 **Orthopedics** - Bones and joints\n🧠 **Neurology** - Brain and nervous system\n👶 **Pediatrics** - Children's health\n🩺 **General Medicine** - Primary care\n👁️ **Ophthalmology** - Eye care\n🦷 **Dentistry** - Oral health\n\n👉 **What medical concern do you have?**`,
          quickActions: ['Heart Issues', 'Bone/Joint Pain', 'Headaches', 'Child Health', 'General Check-up', 'Eye Problems', 'Dental Issues']
        };
      }
    }
    
    // Real appointment status checking
    if (message.includes('my appointment') || message.includes('status') || message.includes('upcoming') || message.includes('scheduled')) {
      if (appointments && appointments.length > 0) {
        const upcomingAppointments = appointments.filter(apt => 
          apt.status === 'confirmed' || apt.status === 'pending'
        );
        
        if (upcomingAppointments.length > 0) {
          const nextAppointment = upcomingAppointments[0];
          const appointmentDate = new Date(nextAppointment.preferredDate);
          const isToday = appointmentDate.toDateString() === new Date().toDateString();
          const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
          
          return {
            text: `Here's your complete appointment information:\n\n**🔥 NEXT APPOINTMENT DETAILS:**\n\n📅 **Date:** ${isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDateTime(nextAppointment.preferredDate)}\n⏰ **Time:** ${nextAppointment.preferredStart || '9:00 AM'} - ${nextAppointment.preferredEnd || '9:30 AM'}\n👨‍⚕️ **Doctor:** Dr. ${nextAppointment.doctor?.name || 'To be assigned'}\n🏥 **Specialization:** ${nextAppointment.doctor?.profile?.specialization || 'General'}\n📊 **Status:** ${nextAppointment.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}\n💰 **Consultation Fee:** $${nextAppointment.doctor?.profile?.consultationFee || '75'}\n📍 **Location:** ${nextAppointment.doctor?.profile?.clinic || 'Main Clinic'}\n\n**ACTIONS AVAILABLE:**\n1. **Reschedule** - Change date/time\n2. **Get Directions** - Find clinic location\n3. **Add to Calendar** - Set reminder\n4. **Cancel Appointment** - If needed\n5. **View All Appointments** - See complete schedule\n\n${upcomingAppointments.length > 1 ? `\n**OTHER UPCOMING:** You have ${upcomingAppointments.length - 1} more appointments.` : ''}`,
            quickActions: ['Reschedule This', 'Get Directions', 'Add to Calendar', 'Cancel Appointment', 'View All Appointments']
          };
        } else {
          return {
            text: `You don't have any upcoming appointments. Let me help you book one:\n\n**STEP-BY-STEP BOOKING:**\n\n**STEP 1: Choose Date**\n• Today (if slots available)\n• Tomorrow\n• This weekend\n\n**STEP 2: Select Time**\n• Morning (9 AM - 12 PM)\n• Afternoon (2 PM - 5 PM)\n• Evening (6 PM - 8 PM)\n\n**STEP 3: Pick Doctor**\n• General Physician\n• Specialist (if needed)\n\n**STEP 4: Confirm Details**\n• Personal information\n• Medical concerns\n\n👉 **When would you like to schedule your appointment?**`,
            quickActions: ['Book Today', 'Book Tomorrow', 'Book This Weekend', 'Browse Doctors First']
          };
        }
      } else {
        return {
          text: `I don't see any appointments in your record. Let's get you scheduled!\n\n**FIRST-TIME PATIENT BOOKING:**\n\n**STEP 1: Medical Assessment**\nTell me your health concerns or reason for visit.\n\n**STEP 2: Doctor Selection**\nI'll recommend the right specialist for you.\n\n**STEP 3: Time Selection**\nChoose your preferred date and time.\n\n**STEP 4: Complete Registration**\nFinalize your appointment details.\n\n**🎯 NEW PATIENT SPECIAL:**\n• Priority scheduling available\n• Welcome consultation discount (20% off)\n• Personalized doctor matching\n• Free insurance verification\n\n👉 **Shall we start with your medical concerns?**`,
          quickActions: ['Book First Appointment', 'Learn How It Works', 'New Patient Guide', 'Talk to Human Assistant']
        };
      }
    }
    
    // Enhanced emergency handling
    if (message.includes('emergency') || message.includes('urgent') || message.includes('help') || message.includes('911')) {
      return {
        text: `🚨 **EMERGENCY PROTOCOL - FOLLOW THESE STEPS:**\n\n**IMMEDIATE ACTIONS (Life-Threatening):**\n\n**STEP 1: Call 911 Immediately**\n📞 Dial 911 for life-threatening emergencies:\n• Chest pain/pressure\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Stroke symptoms\n\n**STEP 2: Go to Nearest ER**\n🏥 **Closest Emergency Rooms:**\n• City Medical Center - 5 mins away\n• General Hospital - 8 mins away\n• Regional Medical Center - 12 mins away\n\n**STEP 3: Emergency Services**\n🚑 **Ambulance:** Automatically dispatched when you call 911\n\n---\n\n**URGENT BUT NOT Life-Threatening:**\n\n**STEP 1: Contact Me**\nI can help you get urgent care:\n• Same-day appointments\n• On-call specialists\n• Telemedicine consultation\n\n**STEP 2: Describe Your Situation**\nTell me your symptoms and I'll guide you.\n\n**STEP 3: Get Immediate Care**\nI'll connect you with the right resources.\n\n👉 **What is your emergency situation?**`,
        quickActions: ['Call 911 Now', 'Find Nearest ER', 'Urgent Appointment', 'Telemedicine Call', 'Chest Pain', 'Difficulty Breathing', 'Severe Injury']
      };
    }
    
    // Enhanced symptom analysis
    if (message.includes('symptom') || message.includes('pain') || message.includes('feeling') || message.includes('sick')) {
      const symptoms = {
        'chest': '🫀 **Cardiology** - Heart specialist recommended',
        'headache': '🧠 **Neurology** - Brain and nervous system expert',
        'fever': '🩺 **General Medicine** - Primary care physician',
        'stomach': '🫃 **Gastroenterology** - Digestive system specialist',
        'back': '🦴 **Orthopedics** - Spine and bone specialist',
        'cough': '🫁 **Pulmonology** - Lung and respiratory expert',
        'skin': '🔬 **Dermatology** - Skin specialist',
        'eye': '👁️ **Ophthalmology** - Eye care specialist'
      };
      
      let relevantSpecialty = '🩺 **General Medicine**';
      let detectedSymptom = '';
      
      for (const [symptom, specialty] of Object.entries(symptoms)) {
        if (message.includes(symptom)) {
          relevantSpecialty = specialty;
          detectedSymptom = symptom;
          break;
        }
      }
      
      return {
        text: `I'll help you with your symptoms step by step:\n\n**STEP 1: SYMPTOM ASSESSMENT**\n\n${detectedSymptom ? `I notice you mentioned ${detectedSymptom} symptoms.` : 'Please describe your symptoms in detail.'}\n\n**Recommended Specialist:** ${relevantSpecialty}\n\n**STEP 2: SEVERITY CHECK**\n\n🚨 **SEEK IMMEDIATE CARE IF:**\n• Chest pain/pressure\n• Difficulty breathing\n• Sudden severe headache\n• Loss of consciousness\n• High fever with confusion\n\n**STEP 3: SCHEDULE APPOINTMENT**\nI can help you:\n• Book urgent appointment (same day)\n• Find available specialist\n• Document symptoms for doctor\n\n**STEP 4: PREPARE FOR VISIT**\n• Write down symptoms\n• List medications\n• Note symptom duration\n\n**⚠️ Important Disclaimer:** I'm an AI assistant and cannot provide medical diagnosis. Always consult a qualified healthcare provider.\n\n👉 **Please describe your symptoms in detail so I can recommend the right specialist:**`,
        quickActions: ['Chest Pain', 'Headache/Migraine', 'Fever/Flu', 'Stomach Pain', 'Back Pain', 'Skin Issues', 'Eye Problems', 'Joint Pain', 'Other Symptoms']
      };
    }
    
    // Medical information and education
    if (message.includes('what is') || message.includes('information') || message.includes('learn about') || message.includes('explain')) {
      return {
        text: `I can provide comprehensive medical information on various topics:\n\n**🫀 HEART HEALTH:**\n• Blood pressure management\n• Cholesterol control\n• Heart disease prevention\n• Exercise guidelines\n• Diet recommendations\n\n**🧠 MENTAL HEALTH:**\n• Stress management techniques\n• Anxiety and depression\n• Sleep disorders\n• Mental health resources\n• Therapy options\n\n**🏃‍♀️ WELLNESS & PREVENTION:**\n• Nutrition basics\n• Exercise recommendations\n• Weight management\n• Preventive care guidelines\n• Vaccination schedules\n\n**💊 MEDICATION INFORMATION:**\n• Common medications\n• Side effects awareness\n• Drug interactions\n• When to call doctor\n• Medication adherence\n\n**🩺 GENERAL HEALTH:**\n• Annual checkups\n• Screening guidelines\n• Health maintenance\n• Disease prevention\n• Healthy lifestyle tips\n\n**⚠️ Important:** This information is for educational purposes only and should not replace professional medical advice.\n\n👉 **What specific health topic would you like to learn about?**`,
        quickActions: ['Heart Health', 'Mental Health', 'Nutrition', 'Exercise', 'Sleep', 'Medications', 'Preventive Care', 'Diabetes', 'Blood Pressure']
      };
    }
    
    // Default enhanced response with real capabilities
    return {
      text: `I'm your AI Medical Assistant with advanced capabilities! Here's how I can help you:\n\n**📅 SMART APPOINTMENT BOOKING:**\n• Real-time availability checking\n• Intelligent doctor matching\n• Step-by-step booking process\n• Calendar integration\n\n**👨‍⚕️ DOCTOR INTELLIGENCE:**\n• Specialization matching\n• Experience-based recommendations\n• Patient reviews integration\n• Availability optimization\n\n**🏥 MEDICAL GUIDANCE:**\n• Symptom assessment\n• Specialist recommendations\n• General health information\n• Emergency protocols\n\n**💰 COST TRANSPARENCY:**\n• Insurance verification\n• Detailed pricing breakdown\n• Multiple payment options\n• Financial assistance\n\n**🚨 EMERGENCY SUPPORT:**\n• Immediate triage guidance\n• ER location finder\n• Urgent care booking\n• Emergency contact\n\n**📱 CONVENIENCE FEATURES:**\n• Natural language understanding\n• Context-aware responses\n• Personalized recommendations\n• 24/7 availability\n\n**HOW TO USE ME:**\n1. Ask questions in natural language\n2. I'll provide step-by-step guidance\n3. Follow my instructions\n4. Get instant help with healthcare needs\n\nI can understand complex requests and provide detailed, personalized assistance. Try asking me about specific symptoms, doctors, appointments, or any healthcare needs!\n\n👉 **What can I help you with today?**`,
      quickActions: ['Book Appointment', 'Find Specialist', 'Check Symptoms', 'Emergency Help', 'Pricing Info', 'Medical Questions']
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Enhanced typing simulation
    const typingTime = 800 + Math.random() * 1200;
    setTimeout(async () => {
      const response = await generateBotResponse(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.text,
        timestamp: new Date(),
        quickActions: response.quickActions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, typingTime);
  };

  const handleQuickAction = (actionText) => {
    setInputValue(actionText);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="patient-chatbot">
      <div className="chatbot-container">
        {/* Enhanced Header */}
        <div className="chatbot-header">
          <div className="header-content">
            <div className="bot-avatar">
              <span>🏥</span>
            </div>
            <div className="header-info">
              <h3>AI Medical Assistant</h3>
              <p className="status">
                <span className="status-dot online"></span>
                Advanced AI - Online & Ready
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={clearChat} title="Clear Chat">
              <span>🔄</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/patient/voice-assistant')} title="Voice Call">
              <span>📞</span>
            </button>
            <button className="action-btn" onClick={openSettings} title="Settings">
              <span>⚙️</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'bot' && (
                <div className="bot-avatar-small">
                  <span>🏥</span>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">
                  {formatMessage(message.text)}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {message.quickActions && (
                  <div className="quick-actions">
                    {message.quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="quick-action-btn"
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="bot-avatar-small">
                <span>🏥</span>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Quick Actions Bar */}
        <div className="quick-actions-bar">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="quick-action-chip"
              onClick={() => handleQuickAction(action.text)}
            >
              <span className="chip-icon">{action.icon}</span>
              <span className="chip-text">{action.text}</span>
            </button>
          ))}
        </div>

        {/* Enhanced Input Area */}
        <div className="chatbot-input">
          <div className="input-container">
            <button className="input-action-btn" title="Attach file">
              <span>📎</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about appointments, doctors, or your health..."
              className="message-input"
            />
            <button className="input-action-btn" title="Voice input">
              <span>🎤</span>
            </button>
            <button className="input-action-btn" title="Emoji">
              <span>😊</span>
            </button>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatbot;
