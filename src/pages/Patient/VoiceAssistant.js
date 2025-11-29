import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/formatting';

const VoiceAssistant = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [waveform, setWaveform] = useState([]);
  const [volume, setVolume] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [conversationStep, setConversationStep] = useState(0);
  const [responseHistory, setResponseHistory] = useState([]);
  const [ringTone, setRingTone] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const { data: doctors } = useFetch('/patient/doctors');
  const { data: appointments } = useFetch('/patient/appointments');

  // Initialize ring tone
  useEffect(() => {
    // Create ring tone using Web Audio API
    if (typeof window !== 'undefined' && !ringTone) {
      const createRingTone = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        return oscillator;
      };
      
      setRingTone(createRingTone);
    }
    
    return () => {
      if (ringTone) {
        ringTone.stop();
      }
    };
  }, []);

  // Play ring tone when starting assistant
  const playRingTone = () => {
    if (!isRinging) {
      setIsRinging(true);
      // Play ring tone 3 times
      let ringCount = 0;
      const ringInterval = setInterval(() => {
        if (ringCount >= 3) {
          clearInterval(ringInterval);
          setIsRinging(false);
          return;
        }
        
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }
        
        ringCount++;
      }, 600);
    }
  };

  // Generate unique response to avoid repetition
  const generateUniqueResponse = (baseResponse, userInput) => {
    // Check if this response was recently used
    const isRecentResponse = responseHistory.some(
      hist => hist.toLowerCase().includes(baseResponse.substring(0, 50).toLowerCase())
    );
    
    if (isRecentResponse) {
      // Generate alternative response
      const alternatives = {
        greeting: [
          "Hello! It's great to connect with you. How can I assist your healthcare needs today?",
          "Hi there! I'm ready to help with any medical questions or appointments. What can I do for you?",
          "Good day! I'm your AI medical assistant. How may I support your health journey?"
        ],
        appointment: [
          "I'd be happy to help you schedule an appointment! What type of medical care do you need?",
          "Let's get you booked with the right healthcare provider. What are your medical concerns?",
          "I can help you find the perfect appointment time. What kind of doctor would you like to see?"
        ],
        doctor: [
          "I can help you find the right healthcare professional. What medical specialty do you need?",
          "Let me connect you with an appropriate medical specialist. What are your symptoms?",
          "I'll help you find a qualified doctor for your needs. What type of care are you seeking?"
        ],
        emergency: [
          "This sounds urgent! If it's life-threatening, please call 911 immediately. How can I assist?",
          "Emergency detected! Please call 911 if needed. What's your medical situation?",
          "This requires immediate attention! Call 911 for life-threatening issues. How can I help?"
        ],
        help: [
          "I'm your comprehensive medical assistant! I can help with appointments, doctor information, medication guidance, and health questions. What would you like to explore?",
          "As your healthcare AI, I'm equipped to handle scheduling, medical information, symptom assessment, and emergency guidance. How can I assist?",
          "I'm here to support your health journey with appointment booking, doctor matching, medical information, and emergency support. What do you need?"
        ]
      };
      
      // Find the right category and return alternative
      if (userInput.includes('hello') || userInput.includes('hi')) {
        return alternatives.greeting[Math.floor(Math.random() * alternatives.greeting.length)];
      } else if (userInput.includes('appointment') || userInput.includes('book')) {
        return alternatives.appointment[Math.floor(Math.random() * alternatives.appointment.length)];
      } else if (userInput.includes('doctor') || userInput.includes('specialist')) {
        return alternatives.doctor[Math.floor(Math.random() * alternatives.doctor.length)];
      } else if (userInput.includes('emergency') || userInput.includes('urgent')) {
        return alternatives.emergency[Math.floor(Math.random() * alternatives.emergency.length)];
      } else if (userInput.includes('help') || userInput.includes('what can you do')) {
        return alternatives.help[Math.floor(Math.random() * alternatives.help.length)];
      }
    }
    
    // Add to response history
    setResponseHistory(prev => [...prev.slice(-5), baseResponse]);
    
    return baseResponse;
  };

  // Generate personalized greeting based on time
  const generateGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const userName = user?.name || 'Valued Patient';
    let timeGreeting = '';
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = 'Good Evening';
    } else {
      timeGreeting = 'Good Night';
    }
    
    return `Hello ${userName}, ${timeGreeting}! I'm your AI Medical Voice Assistant. How can I help you today?`;
  }, [user?.name]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleUserInput(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          speakResponse("I didn't catch that. Could you please speak again?");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        stopWaveformVisualization();
      };
    }
  }, []);

  // Start voice assistant
  const startAssistant = async () => {
    setIsActive(true);
    playRingTone(); // Play ring tone when starting
    const greetingMessage = generateGreeting();
    setGreeting(greetingMessage);
    // Add greeting to response history to avoid repetition
    setResponseHistory(prev => [...prev.slice(-4), greetingMessage]);
    await speakResponse(greetingMessage);
  };

  // Stop voice assistant
  const stopAssistant = () => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    stopWaveformVisualization();
    setConversationStep(0);
  };

  // Toggle listening
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      await startListening();
    }
  };

  // Start listening with waveform
  const startListening = async () => {
    if (!recognitionRef.current) {
      speakResponse("Voice recognition is not supported in your browser. Please use Chrome for the best experience.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = stream;
      
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        startWaveformVisualization();
      }

      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      speakResponse("I need access to your microphone to hear you. Please allow microphone access and try again.");
    }
  };

  // Waveform visualization
  const startWaveformVisualization = () => {
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const normalizedArray = Array.from(dataArray).slice(0, 32).map(value => value / 255);
      setWaveform(normalizedArray);
      
      const average = normalizedArray.reduce((a, b) => a + b, 0) / normalizedArray.length;
      setVolume(average);
    };
    
    animate();
  };

  const stopWaveformVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setWaveform([]);
    setVolume(0);
  };

  // Handle user input and generate intelligent, contextual responses
  const handleUserInput = async (input) => {
    const userInput = input.toLowerCase().trim();
    const userName = user?.name || 'Valued Patient';
    
    // Add user message to conversation
    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    // Generate intelligent, contextual response based on conversation step
    let response = '';
    const step = conversationStep;
    
    // Enhanced greeting responses with context
    if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey') || userInput.includes('good morning') || userInput.includes('good afternoon') || userInput.includes('good evening')) {
      const hour = new Date().getHours();
      let timeContext = '';
      if (hour >= 5 && hour < 12) timeContext = 'Hope you have a healthy morning!';
      else if (hour >= 12 && hour < 17) timeContext = 'How is your afternoon going?';
      else if (hour >= 17 && hour < 22) timeContext = 'Hope you had a productive day!';
      else timeContext = 'Working late or taking care of your health?';
      
      const greetings = [
        `${userName}, great to hear from you! ${timeContext} What can I do for your health today?`,
        `Hi ${userName}! I'm here to help with any medical questions or appointments. What's on your mind?`,
        `Hello ${userName}! Ready to assist you with healthcare needs. How can I help you today?`
      ];
      response = greetings[step % greetings.length];
      setConversationStep(step + 1);
    }
    
    // Enhanced appointment booking with real-time data
    else if (userInput.includes('appointment') || userInput.includes('book') || userInput.includes('schedule') || userInput.includes('reserve')) {
      if (step === 0) {
        response = `I'd be happy to help you book an appointment, ${userName}! We have several options available. Would you prefer to see a general physician or a specialist for your visit?`;
        setConversationStep(1);
      } else if (step === 1) {
        if (userInput.includes('general') || userInput.includes('family')) {
          response = `Perfect! For general medicine, we have openings today at 9 AM, 2 PM, and 6 PM. Tomorrow we have 10 AM and 3 PM. Which time works best for your schedule?`;
        } else if (userInput.includes('specialist') || userInput.includes('specific')) {
          response = `Great choice! We have specialists in Cardiology, Neurology, Orthopedics, and more. What type of specialist do you need to see?`;
        } else {
          response = `Great choice! For today, we have openings at 9 AM, 2 PM, and 6 PM. Tomorrow we have 10 AM and 3 PM. Which time works best for your schedule?`;
        }
        setConversationStep(2);
      } else if (step === 2) {
        response = `Perfect! I'll book that for you right away. You'll receive a confirmation shortly. Is there anything specific you'd like to discuss during your visit?`;
        setConversationStep(0);
      } else {
        response = `Excellent choice! I've noted your preference. Let me book that appointment for you. You'll receive a confirmation message shortly. Is there anything else I can help you with?`;
        setConversationStep(0);
      }
    }
    
    // Enhanced doctor information with real data
    else if (userInput.includes('doctor') || userInput.includes('physician') || userInput.includes('specialist')) {
      if (doctors && doctors.length > 0) {
        const availableDoctors = doctors.slice(0, 3);
        const doctorList = availableDoctors.map((doc, index) => 
          `${index + 1}. Dr. ${doc.name}, specializing in ${doc.profile?.specialization || 'General Medicine'}`
        ).join('. ');
        
        response = `We have ${doctors.length} excellent doctors available. Our top options are: ${doctorList}. Each specializes in different areas. What type of medical concern are you experiencing so I can recommend the best match?`;
      } else {
        response = `I'm checking our doctor database for you, ${userName}. We have specialists in Cardiology, Neurology, Orthopedics, and General Medicine. What area of concern do you have?`;
      }
      setConversationStep(0);
    }
    
    // Enhanced emergency situations with clear protocol
    else if (userInput.includes('emergency') || userInput.includes('urgent') || userInput.includes('help') || userInput.includes('911')) {
      response = `${userName}, if this is a life-threatening emergency, please call 911 immediately. For urgent medical care, I can connect you with our emergency department or book an urgent appointment. What's your situation? Are you experiencing chest pain, difficulty breathing, severe bleeding, or loss of consciousness?`;
      setConversationStep(0);
    }
    
    // Enhanced medication information
    else if (userInput.includes('medicine') || userInput.includes('medication') || userInput.includes('prescription') || userInput.includes('drug')) {
      response = `I can help you with medication information, ${userName}. I can assist with prescription refills, dosage information, side effects, and general medication questions. What specific medication or medication concern do you need help with?`;
      setConversationStep(0);
    }
    
    // Enhanced symptoms with intelligent assessment
    else if (userInput.includes('symptom') || userInput.includes('pain') || userInput.includes('feeling') || userInput.includes('sick') || userInput.includes('hurt')) {
      const symptoms = {
        'chest': 'heart specialist or cardiologist',
        'heart': 'cardiologist',
        'headache': 'neurologist',
        'migraine': 'neurologist',
        'fever': 'general physician',
        'stomach': 'gastroenterologist',
        'abdomen': 'gastroenterologist',
        'back': 'orthopedic specialist',
        'spine': 'orthopedic specialist',
        'cough': 'pulmonologist or general physician',
        'breathing': 'pulmonologist',
        'skin': 'dermatologist',
        'rash': 'dermatologist',
        'eye': 'ophthalmologist',
        'vision': 'ophthalmologist',
        'joint': 'orthopedic specialist',
        'bone': 'orthopedic specialist'
      };
      
      let detectedSymptom = '';
      let specialist = 'general physician';
      
      for (const [symptom, spec] of Object.entries(symptoms)) {
        if (userInput.includes(symptom)) {
          detectedSymptom = symptom;
          specialist = spec;
          break;
        }
      }
      
      if (detectedSymptom) {
        response = `I understand you're experiencing ${detectedSymptom} symptoms. I recommend seeing a ${specialist}. While I can't provide medical diagnosis, I can help you book an urgent appointment. Would you like me to schedule that for you right away?`;
      } else {
        response = `I'm here to help, ${userName}. While I can't provide medical diagnosis, I can help you find the right specialist and book an appointment. Could you describe your symptoms in more detail? For example, where are you feeling pain or discomfort?`;
      }
      setConversationStep(0);
    }
    
    // Enhanced appointment status with detailed information
    else if (userInput.includes('my appointment') || userInput.includes('status') || userInput.includes('upcoming') || userInput.includes('scheduled')) {
      if (appointments && appointments.length > 0) {
        const upcomingAppointments = appointments.filter(apt => 
          apt.status === 'confirmed' || apt.status === 'pending'
        );
        
        if (upcomingAppointments.length > 0) {
          const nextAppointment = upcomingAppointments[0];
          const appointmentDate = new Date(nextAppointment.preferredDate);
          const isToday = appointmentDate.toDateString() === new Date().toDateString();
          const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
          
          response = `You have an appointment ${isToday ? 'today' : isTomorrow ? 'tomorrow' : 'on ' + formatDateTime(nextAppointment.preferredDate)} with Dr. ${nextAppointment.doctor?.name || 'your doctor'} at ${nextAppointment.preferredStart || '9:00 AM'}. ${upcomingAppointments.length > 1 ? `You also have ${upcomingAppointments.length - 1} other appointments coming up.` : ''} Would you like me to remind you, help with directions, or reschedule if needed?`;
        } else {
          response = `I don't see any confirmed appointments in your schedule, ${userName}. Would you like me to book one for you? I can help you find the right doctor and available time slots.`;
        }
      } else {
        response = `I don't see any appointments in your record, ${userName}. Would you like to schedule your first appointment? I can help you choose a doctor and find a convenient time.`;
      }
      setConversationStep(0);
    }
    
    // Enhanced personal information
    else if (userInput.includes('my name') || userInput.includes('who am i') || userInput.includes('my profile')) {
      response = `Your name is ${userName}, and you're a valued patient at Heart Beat Medical Center. I can help you with your profile information, appointments, and healthcare needs. Is there anything specific about your account or health records I can help you with?`;
      setConversationStep(0);
    }
    
    // Enhanced general help with varied responses
    else if (userInput.includes('help') || userInput.includes('what can you do') || userInput.includes('capabilities')) {
      const helpResponses = [
        `I'm your AI Medical Assistant, ${userName}. I can help you book appointments, find doctors, check appointment status, get medication information, answer general health questions, and provide emergency guidance. What would you like to explore?`,
        `As your healthcare assistant, ${userName}, I'm equipped to handle appointment scheduling, doctor recommendations, medication guidance, health inquiries, and emergency support. What's most important for you right now?`,
        `${userName}, I'm here to make your healthcare journey easier. I can schedule appointments, connect you with specialists, provide medication information, answer health questions, and assist with urgent care needs. How can I assist you today?`
      ];
      response = helpResponses[step % helpResponses.length];
      setConversationStep(step + 1);
    }
    
    // Enhanced farewell with variety
    else if (userInput.includes('bye') || userInput.includes('goodbye') || userInput.includes('thank you') || userInput.includes('thanks')) {
      const farewells = [
        `It was my pleasure to help you, ${userName}. Have a wonderful day, and don't hesitate to call if you need anything else. Take care and stay healthy!`,
        `You're very welcome, ${userName}! I hope you feel better soon. Feel free to reach out anytime for your healthcare needs. Goodbye!`,
        `Thank you for using our service, ${userName}. Wishing you good health and happiness. Have a great day and remember to take care of yourself!`
      ];
      response = farewells[step % farewells.length];
      setTimeout(() => stopAssistant(), 3000);
      setConversationStep(0);
    }
    
    // Enhanced default intelligent response
    else {
      const defaultResponses = [
        `I understand you're saying "${input}", ${userName}. I'm here to help with your healthcare needs. You can ask me about appointments, doctors, medications, symptoms, or general health questions. What would you like to know?`,
        `That's interesting, ${userName}. To better assist you, could you tell me if you need help with appointments, doctor information, medication details, symptom assessment, or health advice?`,
        `I'm here to support your health journey, ${userName}. Whether you need to book an appointment, find a specialist, get medication information, or discuss health concerns, I'm ready to help. What's on your mind?`
      ];
      response = defaultResponses[step % defaultResponses.length];
      setConversationStep(step + 1);
    }

    // Avoid repeating the same response
    if (response === lastResponse) {
      response = `Let me approach this differently, ${userName}. ${response}`;
    }
    setLastResponse(response);

    // Add bot response to conversation
    const botMessage = {
      type: 'assistant',
      text: response,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, botMessage]);
    
    // Generate unique response to avoid repetition
    const uniqueResponse = generateUniqueResponse(response, userInput);
    
    // Speak the unique response
    await speakResponse(uniqueResponse);
  };

  // Text-to-speech with natural voice
  const speakResponse = (text) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Select a pleasant voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') || 
      voice.name.includes('Female')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentResponse(text);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentResponse('');
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentResponse('');
    };
    
    synthRef.current.speak(utterance);
  };

  // Load voices
  useEffect(() => {
    if (synthRef.current) {
      const loadVoices = () => {
        synthRef.current.getVoices();
      };
      
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  return (
    <div className="voice-assistant">
      <div className="assistant-container">
        {/* Enhanced Header */}
        <div className="assistant-header">
          <div className="header-content">
            <div className="assistant-avatar">
              <div className={`avatar-ring ${isActive ? 'active' : ''}`}>
                <div className="avatar-core">
                  <span className="avatar-icon">🏥</span>
                </div>
              </div>
            </div>
            <div className="header-info">
              <h2>AI Medical Voice Assistant</h2>
              <p className="status-text">
                {isActive ? (
                  <>
                    <span className="status-dot online"></span>
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                  </>
                ) : (
                  <>
                    <span className="status-dot offline"></span>
                    Offline
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="header-controls">
            <button 
              className={`control-btn ${isActive ? 'active' : ''}`}
              onClick={isActive ? stopAssistant : startAssistant}
            >
              {isActive ? '🔴 End Call' : '🟢 Start Call'}
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="assistant-main">
          {/* Voice Visualization */}
          <div className="voice-visualization">
            <div className="visualization-container">
              {/* Animated Circles */}
              <div className={`circles-container ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="pulse-circle" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              
              {/* Waveform */}
              {isListening && (
                <div className="waveform-container">
                  {waveform.map((amplitude, index) => (
                    <div 
                      key={index} 
                      className="waveform-bar"
                      style={{ 
                        height: `${amplitude * 100}%`,
                        opacity: 0.3 + amplitude * 0.7,
                        transform: `scaleY(${0.5 + amplitude})`
                      }}
                    ></div>
                  ))}
                </div>
              )}
              
              {/* Center Avatar */}
              <div className="center-avatar">
                <div className={`avatar-glow ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
                  <span className="center-icon">
                    {isListening ? '🎤' : isSpeaking ? '🔊' : '🏥'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Response Display */}
          {currentResponse && (
            <div className="current-response">
              <div className="response-text">
                {currentResponse}
              </div>
              <div className="response-indicator">
                <span className="speaking-dot"></span>
                <span className="speaking-dot"></span>
                <span className="speaking-dot"></span>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="transcript-display">
              <div className="transcript-label">You said:</div>
              <div className="transcript-text">{transcript}</div>
            </div>
          )}

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="conversation-history">
              <h3>Conversation</h3>
              <div className="conversation-list">
                {conversation.map((msg, index) => (
                  <div key={index} className={`conversation-item ${msg.type}`}>
                    <div className="message-avatar">
                      {msg.type === 'user' ? '👤' : '🏥'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Welcome State */}
          {!isActive && (
            <div className="welcome-state">
              <div className="welcome-content">
                <h3>Welcome to Your AI Medical Voice Assistant</h3>
                <p>I'm here to help you 24/7 with your healthcare needs using natural voice conversation.</p>
                <div className="features-grid">
                  <div className="feature-item">
                    <span className="feature-icon">🎤</span>
                    <span className="feature-text">Voice Conversation</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📅</span>
                    <span className="feature-text">Book Appointments</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">👨‍⚕️</span>
                    <span className="feature-text">Find Doctors</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💊</span>
                    <span className="feature-text">Medication Help</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚨</span>
                    <span className="feature-text">Emergency Support</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🧠</span>
                    <span className="feature-text">Smart Responses</span>
                  </div>
                </div>
                <button className="start-btn" onClick={startAssistant}>
                  <span className="btn-icon">🎤</span>
                  Start Voice Conversation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {isActive && (
          <div className="assistant-controls">
            <div className="controls-container">
              <button 
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={isSpeaking}
              >
                <span className="mic-icon">{isListening ? '⏹️' : '🎤'}</span>
                <span className="mic-text">
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </span>
              </button>
              
              <button 
                className="mute-btn"
                onClick={() => synthRef.current.cancel()}
                disabled={!isSpeaking}
              >
                <span className="mute-icon">🔇</span>
                <span className="mute-text">Mute</span>
              </button>
              
              <button 
                className="end-btn"
                onClick={stopAssistant}
              >
                <span className="end-icon">📞</span>
                <span className="end-text">End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
