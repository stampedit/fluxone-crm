'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateOnboardingStep, getOnboardingProgress, completeOnboarding } from '@/services/authService';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    phone: '',
    address: '',
    emergencyContact: '',
    trainingComplete: false,
    toolsFamiliar: false,
    scheduleUnderstood: false,
    safetyAcknowledged: false
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Minor Cleaning Service!',
      description: 'We\'re excited to have you join our team. Let\'s get you set up for success.',
      component: 'WelcomeStep'
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Help us get to know you better by completing your profile information.',
      component: 'ProfileStep'
    },
    {
      id: 'training',
      title: 'Training Overview',
      description: 'Learn about our cleaning standards, procedures, and quality expectations.',
      component: 'TrainingStep'
    },
    {
      id: 'tools',
      title: 'Tools & Equipment',
      description: 'Familiarize yourself with our professional cleaning tools and equipment.',
      component: 'ToolsStep'
    },
    {
      id: 'schedule',
      title: 'Schedule & Time Tracking',
      description: 'Learn how to use our scheduling system and track your work hours.',
      component: 'ScheduleStep'
    },
    {
      id: 'safety',
      title: 'Safety Guidelines',
      description: 'Important safety procedures and guidelines to keep you safe on the job.',
      component: 'SafetyStep'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Congratulations on completing your onboarding! You\'re ready to start.',
      component: 'CompleteStep'
    }
  ];

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.onboardingComplete) {
      router.push('/dashboard');
      return;
    }
    
    const progress = getOnboardingProgress();
    if (progress) {
      const stepIndex = onboardingSteps.findIndex(step => step.id === progress.currentStep.id);
      setCurrentStep(stepIndex);
    }
  }, [router]);

  const handleNext = async () => {
    setLoading(true);
    try {
      const currentStepData = onboardingSteps[currentStep];
      await updateOnboardingStep(currentStepData.id);
      
      if (currentStep === onboardingSteps.length - 1) {
        // Complete onboarding
        await completeOnboarding();
        router.push('/dashboard');
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.component) {
      case 'WelcomeStep':
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome! We're excited to have you join our team at Minor Cleaning Service.</div>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
              This onboarding process will take about 10-15 minutes and will help you get familiar with our systems, procedures, and expectations.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                What you'll learn:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '8px' }}>1.</span>
                  Our cleaning standards and quality expectations
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '8px' }}>2.</span>
                  How to use our scheduling and time tracking system
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '8px' }}>3.</span>
                  Safety procedures and guidelines
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '8px' }}>4.</span>
                  Tools and equipment you'll be using
                </li>
              </ul>
            </div>
          </div>
        );
      
      case 'ProfileStep':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Complete Your Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={onboardingData.phone}
                  onChange={(e) => setOnboardingData({...onboardingData, phone: e.target.value})}
                  className="input"
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData({...onboardingData, address: e.target.value})}
                  className="input"
                  placeholder="Your home address"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={onboardingData.emergencyContact}
                  onChange={(e) => setOnboardingData({...onboardingData, emergencyContact: e.target.value})}
                  className="input"
                  placeholder="Emergency contact name and phone"
                />
              </div>
            </div>
          </div>
        );
      
      case 'TrainingStep':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Training Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Our Cleaning Standards
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>All surfaces must be cleaned to our quality standards</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Follow the cleaning checklist for each job</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Report any issues immediately to your supervisor</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Maintain professional appearance and attitude</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Quality Expectations
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>1.</span>
                      <span>Customer satisfaction is our top priority</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>2.</span>
                      <span>Pay attention to detail in every job</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>3.</span>
                      <span>Be on time and prepared for every shift</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>4.</span>
                      <span>Communicate professionally with clients</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onboardingData.trainingComplete}
                    onChange={(e) => setOnboardingData({...onboardingData, trainingComplete: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    I have read and understand the cleaning standards and quality expectations
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'ToolsStep':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Tools & Equipment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Standard Cleaning Equipment
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>-</span>
                      <span>Professional vacuum cleaners</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>-</span>
                      <span>Microfiber cloths and mops</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>-</span>
                      <span>Eco-friendly cleaning solutions</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>-</span>
                      <span>Trash liners and disposal bags</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>-</span>
                      <span>Personal protective equipment (gloves, masks)</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Safety Equipment
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Safety vests for visibility</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Non-slip shoes required</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>First aid kit in every vehicle</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Wet floor signs when mopping</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onboardingData.toolsFamiliar}
                    onChange={(e) => setOnboardingData({...onboardingData, toolsFamiliar: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    I am familiar with the standard cleaning tools and safety equipment
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'ScheduleStep':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Schedule & Time Tracking
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Using the Scheduling System
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>1.</span>
                      <span>Check your schedule daily on the mobile app</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>2.</span>
                      <span>Clock in when you arrive at each job</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>3.</span>
                      <span>Clock out when you complete each job</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px', marginTop: '2px' }}>4.</span>
                      <span>Report any issues or delays immediately</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Time Tracking Guidelines
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Be punctual - arrive 5 minutes before scheduled time</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Accurate time tracking is essential for payroll</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Take photos of completed work when required</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', marginRight: '8px', marginTop: '2px' }}>+</span>
                      <span>Communicate with your supervisor about schedule changes</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onboardingData.scheduleUnderstood}
                    onChange={(e) => setOnboardingData({...onboardingData, scheduleUnderstood: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    I understand how to use the scheduling system and time tracking procedures
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'SafetyStep':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Safety Guidelines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Important Safety Rules
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--error)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Always wear appropriate PPE (gloves, non-slip shoes)</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--error)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Use wet floor signs when mopping</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--error)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Never mix cleaning chemicals unless trained</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--error)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Report any accidents or injuries immediately</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--error)', marginRight: '8px', marginTop: '2px' }}>!</span>
                      <span>Keep work areas clean and organized</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div className="card-body">
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Emergency Procedures
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>1.</span>
                      <span>Call 911 for medical emergencies</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>2.</span>
                      <span>Contact your supervisor for work-related issues</span>
                    </li>
                    <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>3.</span>
                      <span>First aid kit location: In every vehicle</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--warning)', marginRight: '8px', marginTop: '2px' }}>4.</span>
                      <span>Emergency contacts posted in break room</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={onboardingData.safetyAcknowledged}
                    onChange={(e) => setOnboardingData({...onboardingData, safetyAcknowledged: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    I acknowledge and understand all safety guidelines and emergency procedures
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'CompleteStep':
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>Congratulations! You've successfully completed your onboarding.</div>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '30px' }}>
              You're now ready to start your journey with Minor Cleaning Service. We're excited to have you on our team!
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                What's Next:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)', marginRight: '8px' }}>1.</span>
                  <span>Check your schedule in the app</span>
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)', marginRight: '8px' }}>2.</span>
                  <span>Review your first job details</span>
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)', marginRight: '8px' }}>3.</span>
                  <span>Contact your supervisor if you have questions</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)', marginRight: '8px' }}>4.</span>
                  <span>Have a great first day!</span>
                </li>
              </ul>
            </div>
            
            <div style={{ marginTop: '30px', padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                Welcome to the team! We're here to support you every step of the way.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      {/* Progress Bar */}
      <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: '16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0' }}>
              Onboarding Progress
            </h2>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-body">
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn btn-secondary"
              style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
            >
              Back
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index <= currentStep ? 'var(--primary)' : 'var(--border)'
                  }}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Loading...' : currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
