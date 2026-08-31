'use client';

import { useState, useEffect, Suspense } from 'react';
import { getLeads, updateLead, deleteAllMessages } from '@/services/supabaseService';
import { getCurrentUser } from '@/services/authService';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import { useRouter, useSearchParams } from 'next/navigation';

const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    name: 'Cold Introduction',
    subject: 'Professional cleaning services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We provide professional commercial cleaning for businesses like yours in the {city} area.

I noticed your business and wanted to reach out — a clean, sanitized workspace makes a huge impression on your customers and keeps your team healthy and productive. We specialize in:

  - Regular daily/weekly cleaning & sanitizing
  - Deep cleaning of high-traffic areas
  - Floor care (stripping, waxing, buffing)
  - Restroom sanitization & restocking
  - Window & glass cleaning
  - Disinfection services

We're licensed, insured, and use EPA-approved products. I'd love to stop by for a quick 10-minute walkthrough of your space and provide a free, no-obligation quote.

Are you available sometime this week?

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'followup',
    name: 'Follow Up',
    subject: 'Following up - free cleaning quote for {businessName}',
    body: `Hi {businessName} team,

I reached out recently about professional cleaning services for your location. I know you're busy running your business, so I'll keep this brief.

We're currently offering a free first walkthrough and quote — no strings attached. Many of our clients were surprised at how affordable regular cleaning service can be, especially compared to the cost of having staff handle it themselves.

Would you be open to a quick 10-minute visit this week? I can work around your schedule.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'offer',
    name: 'Special Offer',
    subject: 'First month 20% off - cleaning services for {businessName}',
    body: `Hi {businessName} team,

I'm reaching out with a special offer that I think could really benefit your business.

For a limited time, Minor Cleaning Service is offering new clients:
  - FREE on-site walkthrough and consultation
  - 20% OFF your first month of cleaning service
  - FREE deep clean of one high-traffic area (lobby, entrance, or restrooms)

Whether you need daily, weekly, or bi-weekly service, we'll customize a plan that fits your space and budget. All our staff are background-checked, trained, and insured.

Would you like to schedule your free walkthrough? I have openings this week.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'restaurant',
    name: 'Restaurant Cleaning',
    subject: 'Restaurant cleaning & sanitization for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We specialize in restaurant and food service cleaning in the {city} area.

Running a restaurant means dealing with grease, food spills, health inspections, and high customer traffic. We understand the unique cleaning challenges restaurants face and offer:

  - Kitchen deep cleaning (hoods, grills, floors, drains)
  - Dining area sanitization between shifts
  - Restroom deep cleaning & restocking
  - Grease trap area maintenance
  - Health inspection prep cleaning
  - Tile & grout cleaning
  - Odor elimination

We work around your hours — early morning or late night — so your restaurant is spotless before doors open.

Would you be available for a quick walkthrough of your space? I can provide a custom quote based on your kitchen size and seating area.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'office',
    name: 'Office Cleaning',
    subject: 'Office cleaning services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We provide professional office cleaning for businesses like yours in the {city} area.

A clean office isn't just about appearances — it reduces employee sick days, boosts productivity, and creates a professional environment for clients and visitors. We offer:

  - Daily/weekly office cleaning & trash removal
  - Desk, keyboard & phone sanitization
  - Breakroom & kitchen area cleaning
  - Restroom sanitization & restocking
  - Vacuuming & carpet care
  - Glass & window cleaning
  - Disinfection & fogging services

We can work after hours so your team isn't disrupted. All our staff are background-checked and insured.

Would you like a free walkthrough and quote? I'm available this week.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'medical',
    name: 'Medical/Dental Cleaning',
    subject: 'Medical facility cleaning & disinfection for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We specialize in cleaning medical and dental offices in the {city} area.

Healthcare facilities require a higher standard of cleaning — patients expect a spotless, sterile environment. Our team is trained in medical-grade cleaning protocols:

  - Waiting room & reception area sanitization
  - Exam room & treatment area disinfection
  - Restroom deep cleaning & sanitization
  - High-touch surface disinfection (door handles, light switches, chairs)
  - Medical waste area cleaning
  - Floor sanitization (tile, vinyl, carpet)
  - OSHA-compliant cleaning procedures
  - EPA-approved hospital-grade disinfectants

We understand the importance of infection control and can schedule cleaning around your patient hours.

Would you be available for a walkthrough of your facility? I can provide a customized cleaning plan.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'apartments',
    name: 'Apartment Buildings',
    subject: 'Apartment & multi-unit cleaning services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We specialize in cleaning apartment complexes and multi-unit residential properties in the {city} area.

Managing multiple units means dealing with turnovers, common areas, and tenant satisfaction. We offer:

  - Move-out/move-in deep cleaning between tenants
  - Common area cleaning (lobbies, hallways, elevators, stairwells)
  - Laundry room & fitness center sanitization
  - Trash room & chute cleaning
  - Window & glass cleaning
  - Carpet cleaning & deodorizing
  - Pressure washing (walkways, patios, building exteriors)
  - Emergency cleaning (water damage, biohazard)

We can handle properties of any size — from small complexes to large multi-building communities. Our team is trained to work efficiently across multiple units with consistent quality.

Would you be available for a walkthrough of your property? I can provide a custom cleaning plan based on your unit count and common areas.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'postconstruction',
    name: 'Post-Construction',
    subject: 'Post-construction cleaning for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We specialize in post-construction and final cleanup for newly built or renovated properties in the {city} area.

After construction, there's dust, debris, and fine particles everywhere — in vents, on fixtures, behind appliances. We handle the detailed final clean that makes a property truly move-in ready:

  - Rough clean (remove large debris, dust from framing)
  - Final clean (detailed cleaning of all surfaces, fixtures, floors)
  - Touch-up clean (after final inspections and punch lists)
  - Window & glass cleaning (remove construction labels, stucco, paint)
  - Floor care (strip, wax, buff hard floors; deep clean carpets)
  - Air vent & duct cleaning (construction dust removal)
  - Exterior pressure washing
  - Trash & construction debris removal

We work with builders, contractors, and property managers to ensure properties are spotless before handover or listing.

Would you like to discuss your upcoming projects? I can provide a quote based on square footage and scope.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'homebuilders',
    name: 'Home Builders',
    subject: 'Final clean services for {businessName} - move-in ready homes',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We provide final cleaning services for home builders in the {city} area.

When a home is ready for handover, the last thing you want is a buyer walking into dust and debris. We specialize in making new builds truly move-in ready:

  - Pre-handover final clean (all rooms, bathrooms, kitchen)
  - Window cleaning (remove construction labels, stucco, paint splatter)
  - Floor care (sweep, mop, vacuum, detail hard surfaces)
  - Cabinet & drawer interior cleaning
  - Light fixture & ceiling fan dusting
  - Vent & register cleaning
  - Garage & exterior cleanup
  - Touch-up cleans after punch list items

We understand builder timelines and can work around your schedule — including weekends and evenings — to ensure homes are ready for closing.

I'd love to be your go-to cleaning partner for your current and upcoming builds. Are you available to discuss your projects?

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'realtors',
    name: 'Realtors',
    subject: 'Listing prep & move-in cleaning services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We help real estate professionals in the {city} area get listings show-ready and homes move-in clean for buyers.

A clean home sells faster and for more money. We offer:

  - Pre-listing deep clean (make the property shine for photos & showings)
  - Move-in clean for buyers (fresh, sanitized before they move in)
  - Move-out clean for sellers (leave the property in great shape)
  - Quick refresh cleans between showings
  - Window & glass cleaning
  - Carpet cleaning & deodorizing
  - Pressure washing (driveways, patios, siding)
  - Odor elimination (pet, smoke, cooking)

We can accommodate tight closing timelines and last-minute listing prep. Many realtors we work with include our cleaning as a listing perk to help sell faster.

Would you like to set up a walkthrough of one of your current listings? I can provide a quote and discuss ongoing partnership pricing.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'construction',
    name: 'Construction Companies',
    subject: 'Construction site cleaning & cleanup services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We provide cleaning services for construction companies in the {city} area — from ongoing site maintenance to final handover cleans.

Construction sites need cleaning at every phase, and we're equipped to handle it:

  - Ongoing site cleaning (trash removal, restroom servicing, break areas)
  - Rough clean (after framing, drywall — remove large debris)
  - Final clean (detailed cleaning before handover or inspection)
  - Window & glass cleaning (remove labels, stucco, paint, caulk)
  - Floor care (strip, wax, buff, polish hard surfaces)
  - Pressure washing (exterior, walkways, parking areas)
  - Dust control & air quality management
  - Construction debris removal

We're OSHA-compliant, insured, and experienced working on active job sites alongside your crews. We can scale our team based on project size and timeline.

Would you like to discuss your current projects? I can provide a cleaning plan tailored to your scope and schedule.

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'commercial',
    name: 'Commercial Cleaning',
    subject: 'Commercial cleaning & janitorial services for {businessName}',
    body: `Hi {businessName} team,

I'm with Minor Cleaning Service. We provide professional commercial and janitorial cleaning services for businesses in the {city} area.

Whether you have a small office or a large commercial facility, we customize our services to fit your needs:

  - Daily, weekly, or bi-weekly janitorial service
  - Floor care (stripping, waxing, buffing, polishing)
  - Carpet cleaning & stain removal
  - Restroom sanitization & restocking
  - Breakroom & kitchen area cleaning
  - Window & glass cleaning
  - Pressure washing (parking lots, sidewalks, building exteriors)
  - Disinfection & sanitization services
  - Trash removal & recycling
  - HVAC vent & register cleaning

We're licensed, insured, and use commercial-grade EPA-approved products. All our staff are background-checked, trained, and supervised.

I'd love to stop by for a free walkthrough of your facility and provide a no-obligation quote. Are you available this week?

Best regards,
Minor Cleaning Service
(605) 940-8363
https://minorcleaningservices.com/`
  },
  {
    id: 'custom',
    name: 'Custom Message',
    subject: '',
    body: ''
  }
];

function MessagesContent() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('intro');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageHistory, setMessageHistory] = useState({});
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [delayValue, setDelayValue] = useState(1);
  const [delayUnit, setDelayUnit] = useState('days');
  const [spellText, setSpellText] = useState('');
  const [spellResults, setSpellResults] = useState(null);
  const [spellLoading, setSpellLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (searchParams) {
      const leadId = searchParams.get('lead');
      if (leadId && leads.length > 0) {
        const lead = leads.find(l => l.id === leadId || l.id === parseInt(leadId));
        if (lead) {
          handleSelectLead(lead);
        }
      }
    }
  }, [searchParams, leads]);

  const initializeData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      const result = await getLeads();
      const leadsArray = result?.success !== undefined ? (result.data || []) : (Array.isArray(result) ? result : []);
      setLeads(leadsArray);
      
      // Load sent messages from localStorage
      const stored = localStorage.getItem('sentMessages');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSentMessages(parsed);
        // Group by lead
        const grouped = {};
        parsed.forEach(msg => {
          if (!grouped[msg.leadId]) grouped[msg.leadId] = [];
          grouped[msg.leadId].push(msg);
        });
        setMessageHistory(grouped);
      }
      const storedScheduled = localStorage.getItem('scheduledMessages');
      if (storedScheduled) {
        setScheduledMessages(JSON.parse(storedScheduled));
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    applyTemplate(selectedTemplate, lead);
  };

  const applyTemplate = (templateId, lead = selectedLead) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template || !lead) return;
    
    const replacements = {
      businessName: lead.business_name || lead.businessName || 'your business',
      senderName: currentUser?.name || 'Your Name',
      city: lead.city || lead.state || 'your area',
    };
    
    let filledSubject = template.subject;
    let filledBody = template.body;
    
    Object.entries(replacements).forEach(([key, value]) => {
      filledSubject = filledSubject.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      filledBody = filledBody.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    
    setSubject(filledSubject);
    setBody(filledBody);
    setSelectedTemplate(templateId);
  };

  const handleSendEmail = async () => {
    if (!selectedLead) {
      alert('Please select a lead first');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in subject and message body');
      return;
    }
    if (!selectedLead.email) {
      alert('This lead does not have an email address. You can copy the message and send it manually.');
      return;
    }

    setSending(true);
    try {
      // Open email client with pre-filled content
      const mailtoLink = `mailto:${selectedLead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
      // Log the sent message
      const sentMsg = {
        id: Date.now(),
        leadId: selectedLead.id,
        leadName: selectedLead.business_name || selectedLead.businessName,
        leadEmail: selectedLead.email,
        subject,
        body,
        template: selectedTemplate,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      const updatedMessages = [sentMsg, ...sentMessages];
      setSentMessages(updatedMessages);
      localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
      
      // Update message history
      const updatedHistory = { ...messageHistory };
      if (!updatedHistory[selectedLead.id]) updatedHistory[selectedLead.id] = [];
      updatedHistory[selectedLead.id] = [sentMsg, ...updatedHistory[selectedLead.id]];
      setMessageHistory(updatedHistory);
      
      // Update lead status to contacted
      try {
        await updateLead(selectedLead.id, { status: 'contacted' });
        setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: 'contacted' } : l));
      } catch (e) {
        console.error('Error updating lead status:', e);
      }
      
      alert(`Email opened in your mail client for ${selectedLead.email}`);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = () => {
    const fullMessage = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullMessage).then(() => {
      alert('Message copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please copy manually.');
    });
  };

  const handleScheduleMessage = () => {
    if (!selectedLead) {
      alert('Please select a lead first');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in subject and message body');
      return;
    }
    const multiplier = delayUnit === 'days' ? 1 : delayUnit === 'weeks' ? 7 : 30;
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (parseInt(delayValue || 1) * multiplier));

    const scheduled = {
      id: Date.now(),
      leadId: selectedLead.id,
      leadName: selectedLead.business_name || selectedLead.businessName,
      leadEmail: selectedLead.email,
      subject,
      body,
      template: selectedTemplate,
      delayValue: parseInt(delayValue || 1),
      delayUnit,
      scheduledAt: scheduledAt.toISOString(),
      status: 'scheduled'
    };

    const updated = [scheduled, ...scheduledMessages];
    setScheduledMessages(updated);
    localStorage.setItem('scheduledMessages', JSON.stringify(updated));
    alert(`Follow-up scheduled for ${delayValue} ${delayUnit} from now.`);
  };

  const handleDeleteAllMessages = async () => {
    if (!confirm('Are you sure you want to delete ALL messages? This cannot be undone.')) return;
    try {
      await deleteAllMessages();
      setSentMessages([]);
      setMessageHistory({});
      setScheduledMessages([]);
    } catch (error) {
      console.error('Error deleting all messages:', error);
      alert('Error deleting all messages: ' + error.message);
    }
  };

  const runSpellCheck = async (textToCheck) => {
    if (!textToCheck.trim()) return;
    setSpellLoading(true);
    try {
      const res = await fetch('/api/spell-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck })
      });
      const data = await res.json();
      setSpellResults(data.misspellings || []);
    } catch (error) {
      console.error('Spell check error:', error);
      setSpellResults([]);
    } finally {
      setSpellLoading(false);
    }
  };

  const handleSpellCheck = () => runSpellCheck(spellText);
  const handleSpellCheckMessage = () => runSpellCheck(`${subject}\n\n${body}`);
  const handleSpellCheckTemplate = () => {
    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);
    runSpellCheck(`${template?.subject || ''}\n\n${template?.body || ''}`);
  };

  const handleBulkEmail = async () => {
    const leadsWithEmails = leads.filter(l => l.email && (l.status || 'new').toLowerCase() !== 'contacted');
    if (leadsWithEmails.length === 0) {
      alert('No leads with emails to contact');
      return;
    }
    if (!confirm(`Send introduction email to ${leadsWithEmails.length} leads? This will open your email client for each.`)) return;
    
    for (const lead of leadsWithEmails) {
      const template = EMAIL_TEMPLATES.find(t => t.id === 'intro');
      const replacements = {
        businessName: lead.business_name || lead.businessName || 'your business',
        senderName: currentUser?.name || 'Your Name',
        city: lead.city || lead.state || 'your area',
      };
      
      let filledSubject = template.subject;
      let filledBody = template.body;
      Object.entries(replacements).forEach(([key, value]) => {
        filledSubject = filledSubject.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        filledBody = filledBody.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      
      const mailtoLink = `mailto:${lead.email}?subject=${encodeURIComponent(filledSubject)}&body=${encodeURIComponent(filledBody)}`;
      window.open(mailtoLink, '_blank');
      
      // Log
      const sentMsg = {
        id: Date.now() + Math.random(),
        leadId: lead.id,
        leadName: lead.business_name || lead.businessName,
        leadEmail: lead.email,
        subject: filledSubject,
        body: filledBody,
        template: 'intro',
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      const updatedMessages = [sentMsg, ...sentMessages];
      setSentMessages(updatedMessages);
      localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
      
      try {
        await updateLead(lead.id, { status: 'contacted' });
      } catch (e) {
        console.error('Error updating lead status:', e);
      }
      
      // Wait between opens
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLeads(leads.map(l => l.email && (l.status || 'new').toLowerCase() !== 'contacted' ? { ...l, status: 'contacted' } : l));
    alert(`Initiated emails to ${leadsWithEmails.length} leads!`);
  };

  const filteredLeads = leads.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.business_name || l.businessName || '').toLowerCase().includes(term) ||
      (l.email || '').toLowerCase().includes(term) ||
      (l.phone || '').toLowerCase().includes(term)
    );
  });

  const contactedCount = leads.filter(l => (l.status || 'new').toLowerCase() === 'contacted').length;
  const leadsWithEmails = leads.filter(l => l.email).length;

  if (loading) {
    return (
      <AuthGuard>
        <div className="crm-layout">
          <Navigation />
          <div className="crm-main">
            <div className="crm-content">
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading messages...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="crm-layout">
        <Navigation />
        <div className="crm-main">
          <div className="crm-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Messages
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0 }}>
              Email your leads with templates and track responses.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleDeleteAllMessages}
              className="btn btn-outline"
              style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
            >
              Delete All Messages
            </button>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>With Email</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{leadsWithEmails}</div>
            </div>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contacted</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{contactedCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Messages Sent</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{sentMessages.length}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Lead List */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                placeholder="Search leads..."
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredLeads.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                  <div className="card-body">
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No leads found</p>
                  </div>
                </div>
              )}
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => handleSelectLead(lead)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderLeft: selectedLead?.id === lead.id ? '3px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedLead?.id === lead.id ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  }}
                >
                  <div className="card-body" style={{ padding: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {lead.business_name || lead.businessName || 'Unknown'}
                    </h4>
                    {lead.email ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ✉️ {lead.email}
                      </p>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                        No email
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span className="badge badge-blue" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                        {lead.status || 'new'}
                      </span>
                      {messageHistory[lead.id]?.length > 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {messageHistory[lead.id].length} msg{messageHistory[lead.id].length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compose & History */}
          <div>
            {selectedLead ? (
              <>
                {/* Compose */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          {selectedLead.business_name || selectedLead.businessName}
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                          To: {selectedLead.email || 'No email on file'}
                        </p>
                      </div>
                      <button
                        onClick={handleBulkEmail}
                        className="btn btn-outline"
                        style={{ fontSize: '12px' }}
                      >
                        Bulk Email All
                      </button>
                    </div>

                    {/* Template Selector */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                        Email Template
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {EMAIL_TEMPLATES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => applyTemplate(t.id)}
                            className={selectedTemplate === t.id ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input"
                        placeholder="Email subject..."
                      />
                    </div>

                    {/* Body */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                        Message
                      </label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="input"
                        rows={10}
                        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="Type your message..."
                      />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSendEmail}
                        disabled={sending || !selectedLead.email}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        {sending ? 'Opening...' : !selectedLead.email ? 'No Email Address' : 'Send via Email Client'}
                      </button>
                      <button
                        onClick={handleCopyMessage}
                        className="btn btn-outline"
                      >
                        Copy to Clipboard
                      </button>
                    </div>

                    {/* Schedule Follow-up */}
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                        Schedule Follow-up
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Send in</span>
                        <input
                          type="number"
                          min="1"
                          value={delayValue}
                          onChange={(e) => setDelayValue(e.target.value)}
                          className="input"
                          style={{ width: '70px', fontSize: '13px', padding: '4px 8px' }}
                        />
                        <select
                          value={delayUnit}
                          onChange={(e) => setDelayUnit(e.target.value)}
                          className="select"
                          style={{ fontSize: '13px', padding: '4px 8px' }}
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                        <button
                          onClick={handleScheduleMessage}
                          className="btn btn-secondary"
                          style={{ fontSize: '13px' }}
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                    {!selectedLead.email && (
                      <p style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '8px', marginBottom: 0 }}>
                        This lead doesn't have an email. Use "Copy to Clipboard" and send manually, or update the lead's email.
                      </p>
                    )}
                  </div>
                </div>

                {/* Spell Assistant */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="card-body">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                      Spell Assistant (No AI / No API)
                    </h3>
                    <textarea
                      value={spellText}
                      onChange={(e) => setSpellText(e.target.value)}
                      className="input"
                      rows={6}
                      style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', marginBottom: '12px' }}
                      placeholder="Paste text or use a template to check..."
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <button
                        onClick={handleSpellCheck}
                        disabled={!spellText.trim() || spellLoading}
                        className="btn btn-secondary"
                      >
                        {spellLoading ? 'Checking...' : 'Check Text'}
                      </button>
                      <button
                        onClick={handleSpellCheckMessage}
                        className="btn btn-outline"
                      >
                        Check Current Message
                      </button>
                      <button
                        onClick={handleSpellCheckTemplate}
                        className="btn btn-outline"
                      >
                        Check {EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Template'}
                      </button>
                    </div>
                    {spellResults && spellResults.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--error)', margin: '0 0 8px 0' }}>
                          {spellResults.length} possible issue{spellResults.length > 1 ? 's' : ''} found:
                        </p>
                        {spellResults.map((result, idx) => (
                          <div key={idx} style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '600', color: 'var(--error)' }}>{result.word}</span>
                              {result.suggestions.length > 0 && (
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                  Did you mean: {result.suggestions.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : spellResults && spellResults.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--success)', margin: 0 }}>
                        No typos found.
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Message History for this lead */}
                {messageHistory[selectedLead.id]?.length > 0 && (
                  <div className="card">
                    <div className="card-body">
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Message History ({messageHistory[selectedLead.id].length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messageHistory[selectedLead.id].map(msg => (
                          <div
                            key={msg.id}
                            style={{
                              padding: '12px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '8px',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {msg.subject}
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '60px' }}>
                              {msg.body}
                            </p>
                            <div style={{ marginTop: '8px' }}>
                              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                                {msg.status}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                via {msg.template} template
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled Messages */}
                {scheduledMessages.length > 0 && (
                  <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-body">
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Scheduled Follow-ups ({scheduledMessages.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {scheduledMessages
                          .filter(m => m.leadId === selectedLead.id)
                          .map(msg => (
                          <div key={msg.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{msg.subject}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {new Date(msg.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '60px' }}>
                              {msg.body}
                            </p>
                            <div style={{ marginTop: '8px' }}>
                              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                                {msg.status}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                {msg.delayValue} {msg.delayUnit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div className="card-body">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✉️</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Select a Lead to Message
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                    Choose a lead from the list to compose and send an email.
                  </p>
                  <button
                    onClick={() => router.push('/lead-finder')}
                    className="btn btn-primary"
                  >
                    Find New Leads
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
