import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './MemberFeatures.css'

const starterRequests = [
  { id: 'r-1', title: 'Grocery pickup', category: 'Errands', date: '2026-10-14', time: '10:00', details: 'Oakwood', status: 'Volunteer assigned', volunteer: 'Maya A.' },
  { id: 'r-2', title: 'Friendly visit', category: 'Companionship', date: '2026-11-18', time: '15:30', details: 'A friendly chat and tea at home.', status: 'Waiting for volunteer', volunteer: '' },
]
const starterVolunteers = [
  { id: 'v-1', name: 'Jamie Chen', task: 'Grocery pickup', date: 'Oct 14', status: 'Pending' },
  { id: 'v-2', name: 'Omar Hassan', task: 'Friendly visit', date: 'Nov 18', status: 'Pending' },
]
const initialSeniorProfile = { fullName: 'Margaret Morgan', phone: '(555) 010-2042', email: 'margaret@example.com', emergencyContact: 'Alex Morgan · (555) 010-2020' }
const initialCaregiverProfile = { fullName: 'Alex Morgan', phone: '(555) 010-2020', email: 'alex@example.com', emergencyContact: 'Margaret Morgan · (555) 010-2042' }
const initialSettingsPreferences = { taskUpdates: true, wellnessAlerts: true, messages: true, highContrast: false, largerText: true, audioAlerts: false, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], from: '09:00', to: '17:00' }

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function makeNotification(text) {
  return { id: `n-${Date.now()}`, text, time: 'Just now' }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback))
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue]
}

function RequestForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? { title: '', category: 'Errands', date: '', time: '', details: '' })
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  return <div className="sn-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="sn-modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
      <button className="sn-close" onClick={onClose} aria-label="Close">×</button>
      <p className="sn-eyebrow">ASSISTANCE REQUEST</p><h2 id="request-title">{initial ? 'Edit your request' : 'What can we help with?'}</h2>
      <p className="sn-muted">Tell us a little about the help you need.</p>
      <form className="sn-form" onSubmit={(event) => { event.preventDefault(); onSave(form) }}>
        <label>Request title<input name="title" value={form.title} onChange={update} placeholder="e.g. Pick up a prescription" required maxLength="70" /></label>
        <label>Type of help<select name="category" value={form.category} onChange={update}><option>Errands</option><option>Companionship</option><option>Light household help</option><option>Transportation</option><option>Other</option></select></label>
        <div className="sn-form-row"><label>Date<input type="date" name="date" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={update} required /></label><label>Time<input type="time" name="time" value={form.time} onChange={update} required /></label></div>
        <label>Details<textarea name="details" value={form.details} onChange={update} placeholder="Add any details the volunteer should know" rows="3" maxLength="300" /></label>
        <div className="sn-modal-actions"><button type="button" className="sn-button sn-button-light" onClick={onClose}>Cancel</button><button className="sn-button sn-button-primary">{initial ? 'Save changes' : 'Send request'}</button></div>
      </form>
    </section>
  </div>
}

function Notifications({ items, onClose, onClear }) {
  return <div className="sn-notice-panel"><div className="sn-notice-head"><strong>Notifications</strong><button onClick={onClose} aria-label="Close notifications">×</button></div>
    {items.length ? <><div className="sn-notice-list">{items.slice(0, 5).map((item) => <div className="sn-notice" key={item.id}><span className="sn-notice-icon">✦</span><div><p>{item.text}</p><small>{item.time}</small></div></div>)}</div><button className="sn-text-button" onClick={onClear}>Clear notifications</button></> : <p className="sn-empty-note">You’re all caught up.</p>}
  </div>
}

function Status({ status }) {
  const cls = status.toLowerCase().includes('assigned') || status === 'Approved' ? 'green' : status === 'Rejected' || status === 'Cancelled' ? 'gray' : 'gold'
  return <span className={`sn-status ${cls}`}><i />{status}</span>
}

function MessageThread({ messages, setMessages, role, senderName, partnerName, notifications, setNotifications }) {
  const [draft, setDraft] = useState('')
  const send = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    const message = { id: `msg-${Date.now()}`, role, sender: senderName, text, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
    setMessages([...messages, message])
    setNotifications([makeNotification(`Message sent to ${partnerName}.`), ...notifications])
    setDraft('')
  }
  return <section className="senior-box sn-chat-panel">
    <div className="sn-chat-heading"><span className="sn-chat-avatar">{(partnerName || '?').charAt(0).toUpperCase()}</span><div><h2>{partnerName}</h2><p>SilverNest conversation</p></div></div>
    <div className="sn-chat-thread" aria-live="polite">{messages.length ? messages.map((message) => <div className={`sn-chat-row ${message.role === role ? 'own' : 'other'}`} key={message.id}><div className="sn-chat-bubble"><strong>{message.sender}</strong><p>{message.text}</p><small>{message.time}{message.role === role ? ' · Sent' : ''}</small></div></div>) : <div className="sn-chat-empty"><span>♡</span><strong>No messages yet</strong><p>Start a conversation with {partnerName}.</p></div>}</div>
    <form className="sn-chat-compose" onSubmit={send}><label className="sr-only" htmlFor={`message-${role}`}>Write a message</label><textarea id={`message-${role}`} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${partnerName}...`} rows="2" maxLength="500" required /><button className="sn-button sn-button-primary" disabled={!draft.trim()}>Send</button></form>
  </section>
}

function RequestCard({ request, onEdit, onCancel }) {
  return <article className="sn-request-card"><div className="sn-request-symbol">{request.category === 'Companionship' ? '♡' : '⌁'}</div><div className="sn-request-body"><div className="sn-request-top"><div><h3>{request.title}</h3><span className="sn-category">{request.category}</span></div><Status status={request.status} /></div>
    <div className="sn-request-meta"><span>▣ {new Date(`${request.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span>◷ {request.time || 'Time not set'}</span>{request.volunteer && <span>♡ {request.volunteer}</span>}</div>
    {request.details && <p className="sn-request-details">{request.details}</p>}
    {request.status !== 'Cancelled' && <div className="sn-request-actions"><button onClick={() => onEdit(request)}>Edit request</button><button className="sn-danger-link" onClick={() => onCancel(request.id)}>Cancel request</button></div>}
  </div></article>
}

function SeniorSettings({ activeTab, onTabChange, profile, setProfile, roleLabel = 'Senior', preferenceKey = 'silvernest.senior.preferences' }) {
  const [draft, setDraft] = useState(profile)
  const [notice, setNotice] = useState('')
  const [preferences, setPreferences] = useState(() => readStore(preferenceKey, initialSettingsPreferences))
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const tabs = ['Personal Information', 'Security', 'Notifications', 'Accessibility', 'Availability']
  const saveProfile = (event) => { event.preventDefault(); setProfile(draft); setNotice('Updated successfully') }
  const savePreferences = (event) => { event.preventDefault(); localStorage.setItem(preferenceKey, JSON.stringify(preferences)); setNotice('Updated successfully') }
  const cancelProfile = () => { setDraft(profile); setNotice('') }
  const updatePreference = (key) => setPreferences({ ...preferences, [key]: !preferences[key] })
  const toggleDay = (day) => setPreferences({ ...preferences, days: preferences.days.includes(day) ? preferences.days.filter((item) => item !== day) : [...preferences.days, day] })
  const savePassword = (event) => {
    event.preventDefault()
    if (passwords.next !== passwords.confirm) { setNotice('The new passwords do not match.'); return }
    setPasswords({ current: '', next: '', confirm: '' })
    setNotice('Password settings updated for this prototype.')
  }
  const settingToggle = (key, label, description) => <div className="settings-preference" key={key}><div><strong>{label}</strong><span>{description}</span></div><button type="button" className={`settings-toggle ${preferences[key] ? 'on' : ''}`} aria-pressed={preferences[key]} onClick={() => updatePreference(key)}><i />{preferences[key] ? 'On' : 'Off'}</button></div>
  const field = (label, key, type = 'text') => <label className="settings-field"><strong>{label} *</strong><input type={type} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} required /></label>
  const actionRow = (onCancel) => <div className="settings-actions"><button type="submit" className="settings-save">Save Changes</button><button type="button" className="settings-cancel" onClick={onCancel}>Cancel</button></div>

  return <div className="senior-settings">
    <section className="settings-profile-card"><span className="settings-avatar">{(draft.fullName || 'M').charAt(0).toUpperCase()}</span><div><strong>{draft.fullName}</strong><small>Photo placeholder · no photograph in this wireframe</small></div><span className="settings-role">{roleLabel}</span></section>
    <div className="settings-tabs" role="tablist" aria-label="Profile and settings">{tabs.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => { onTabChange(tab); setNotice('') }}>{tab}</button>)}</div>
    <section className="settings-panel">
      <h2>{activeTab}</h2>
      {activeTab === 'Personal Information' && <form onSubmit={saveProfile}><div className="settings-field-grid">{field('Full name', 'fullName')}{field('Phone number', 'phone', 'tel')}{field('Email address', 'email', 'email')}{field('Emergency contact', 'emergencyContact')}</div>{actionRow(cancelProfile)}</form>}
      {activeTab === 'Security' && <form onSubmit={savePassword}><div className="settings-field-grid"><label className="settings-field full"><strong>Current password</strong><input type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required /></label><label className="settings-field"><strong>New password</strong><input type="password" minLength="12" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required /><small>Use at least 12 characters.</small></label><label className="settings-field"><strong>Confirm new password</strong><input type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} required /></label></div><p className="settings-help">Password changes take effect after Save Changes.</p>{actionRow(() => { setPasswords({ current: '', next: '', confirm: '' }); setNotice('') })}</form>}
      {activeTab === 'Notifications' && <form onSubmit={savePreferences}>{settingToggle('taskUpdates', 'Task updates', 'Claims, approvals, cancellations and completion updates.')}{settingToggle('wellnessAlerts', 'Wellness alerts', 'Check-in notifications from linked family members.')}{settingToggle('messages', 'Messages', 'Notify me when a participant sends a message.')}<p className="settings-help">Urgent wellness alerts are clearly identified in Notifications.</p>{actionRow(() => { setPreferences(readStore(preferenceKey, initialSettingsPreferences)); setNotice('') })}</form>}
      {activeTab === 'Accessibility' && <form onSubmit={savePreferences}>{settingToggle('highContrast', 'High-contrast mode', 'Increase contrast for text, controls and selected states.')}{settingToggle('largerText', 'Larger text', 'Use larger labels and body text throughout the workspace.')}{settingToggle('audioAlerts', 'Audio alerts', 'Play a sound when an important notification arrives.')}<p className="settings-help">Preferences apply to your account after saving.</p>{actionRow(() => setNotice(''))}</form>}
      {activeTab === 'Availability' && <form onSubmit={savePreferences}><p className="settings-help">Choose when you are usually available to receive help.</p><div className="settings-days">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <label key={day}><input type="checkbox" checked={preferences.days.includes(day)} onChange={() => toggleDay(day)} />{day}</label>)}</div><div className="settings-time-grid"><label className="settings-field"><strong>Available from</strong><input type="time" value={preferences.from} onChange={(event) => setPreferences({ ...preferences, from: event.target.value })} /></label><label className="settings-field"><strong>Available until</strong><input type="time" value={preferences.to} onChange={(event) => setPreferences({ ...preferences, to: event.target.value })} /></label></div>{actionRow(() => setNotice(''))}</form>}
      {notice && <p className={`settings-notice ${notice.includes('do not match') ? 'error' : ''}`} role="status">{notice}</p>}
    </section>
  </div>
}

function SeniorProfile({ profile, onEdit, roleLabel = 'Senior', description = 'Senior account · Oakwood', onManageLink }) {
  return <section className="senior-box senior-profile-view">
    <div className="senior-profile-summary"><span className="settings-avatar">{(profile.fullName || 'M').charAt(0).toUpperCase()}</span><div><h2>{profile.fullName}</h2><span>{description}</span></div><span className="settings-role">{roleLabel}</span></div>
    <h3>Contact information</h3>
    <dl className="senior-profile-details"><div><dt>Phone number</dt><dd>{profile.phone}</dd></div><div><dt>Email address</dt><dd>{profile.email}</dd></div><div><dt>Emergency contact</dt><dd>{profile.emergencyContact}</dd></div></dl>
    <div className="senior-profile-actions"><button className="senior-profile-edit" onClick={onEdit}>Edit personal information</button>{onManageLink && <button className="senior-profile-edit secondary" onClick={onManageLink}>Link or manage a senior</button>}</div>
  </section>
}

function SeniorDashboard({ requests, setRequests, wellness, setWellness, notifications, setNotifications, messages, setMessages, onNotifications }) {
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [mood, setMood] = useState('')
  const [section, setSection] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [settingsTab, setSettingsTab] = useState('Personal Information')
  const [seniorProfile, setSeniorProfile] = useStoredState('silvernest.senior.profile', initialSeniorProfile)
  const today = new Date().toISOString().slice(0, 10)
  const checkedToday = wellness.date === today
  const active = requests.filter((request) => request.status !== 'Cancelled')
  const pending = active.filter((request) => !request.status.toLowerCase().includes('assigned'))
  const saveRequest = (form) => {
    if (editing) setRequests(requests.map((request) => request.id === editing.id ? { ...request, ...form } : request))
    else setRequests([{ ...form, id: `r-${Date.now()}`, status: 'Waiting for volunteer', volunteer: '' }, ...requests])
    setNotifications([makeNotification(editing ? `Your request “${form.title}” was updated.` : `Your request “${form.title}” was sent.`), ...notifications])
    setShowForm(false); setEditing(null)
  }
  const cancelRequest = (id) => {
    const request = requests.find((item) => item.id === id)
    if (window.confirm(`Cancel “${request?.title}”?`)) setRequests(requests.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item))
  }
  const completeCheckIn = (event) => {
    event.preventDefault()
    if (!mood) return
    setWellness({ date: today, mood })
    setNotifications([makeNotification('Your daily wellness check-in is saved.'), ...notifications])
    setShowCheckIn(false)
  }
  const navItems = [['Dashboard', '⌂'], ['My Requests', '▤'], ['Messages', '▱'], ['Notifications', '♧'], ['Profile', '◉'], ['Settings', '⚙']]
  const visibleRequests = requests.filter((request) => `${request.title} ${request.category} ${request.details}`.toLowerCase().includes(search.toLowerCase()))
  const requestList = <div className="sn-request-list">{visibleRequests.length ? visibleRequests.map((request) => <RequestCard key={request.id} request={request} onEdit={(item) => { setEditing(item); setShowForm(true) }} onCancel={cancelRequest} />) : <p className="sn-empty-note">No matching requests.</p>}</div>

  return <div className="senior-shell">
    <aside className="senior-sidebar"><Link className="senior-logo" to="/">SilverNest</Link><p className="senior-workspace">Senior workspace</p><nav className="senior-nav" aria-label="Senior workspace navigation">{navItems.map(([label, icon]) => <button key={label} onClick={() => { if (label === 'Notifications') onNotifications(); else { setSection(label); if (label === 'Settings' || label === 'Profile') setSettingsTab('Personal Information') } }} className={section === label ? 'selected' : ''}><span>{icon}</span>{label}</button>)}</nav><Link className="senior-logout" to="/">⇥ &nbsp; Log Out</Link></aside>
    <div className="senior-work-area"><header className="senior-topbar"><label className="senior-search"><input placeholder="Search SilverNest..." aria-label="Search SilverNest" value={search} onChange={(event) => setSearch(event.target.value)} /><span>⌕</span></label><div className="senior-account"><button className="senior-bell" aria-label="Open notifications" onClick={onNotifications}>♧{notifications.length > 0 && <i />}</button><span className="senior-avatar">{(seniorProfile.fullName || 'M').charAt(0).toUpperCase()}</span><button className="senior-profile">{seniorProfile.fullName}⌄</button></div></header>
      <main className="senior-main">
        <div className="senior-page-title"><div><h1>{section === 'Settings' ? 'Profile and Settings' : section}</h1><p>Senior workspace · {section === 'Settings' ? settingsTab : section === 'Profile' ? 'Profile' : 'Senior'}</p></div></div>
        {section === 'Dashboard' && <>
          <div className="senior-greeting"><h2>Good morning!</h2><p>Welcome to your SilverNest dashboard.</p></div>
          <div className="senior-stat-grid"><article><div><span className="senior-stat-number">{active.length}</span><h3>Active Requests</h3></div><p>{Math.max(active.length - pending.length, 0)} open · {pending.length} pending</p></article><article><div><span className="senior-stat-number">{checkedToday ? '✓' : '—'}</span><h3>Today’s Check-In</h3></div><p>{checkedToday ? 'Completed' : 'Pending'}</p></article><article><div><span className="senior-stat-number">{notifications.length}</span><h3>Notifications</h3></div><p>{notifications.length === 1 ? 'One unread update' : `${notifications.length} unread updates`}</p></article></div>
          <div className="senior-actions"><button onClick={() => { setEditing(null); setShowForm(true) }}>Request Help</button><button onClick={() => setShowCheckIn(true)}>Daily Check-In</button></div>
          {notifications.some((item) => item.text.toLowerCase().includes('wellness')) && <button className="senior-alert" onClick={onNotifications}><strong>Urgent notification alert</strong><span>A wellness alert needs attention. Open Notifications to review the update.</span></button>}
          <div className="senior-lower-grid"><section className="senior-box"><div className="senior-box-heading"><h2>Recent Activity</h2><button onClick={() => setSection('My Requests')}>View My Requests</button></div>{active.length ? active.slice(0, 2).map((request, index) => <div className="senior-activity-row" key={request.id}><div><strong>{index === 0 ? request.title : 'Volunteer request'}</strong><span>{index === 0 ? `${request.id === 'r-1' ? 'SN-1042 · ' : ''}${new Date(`${request.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Oakwood` : `${request.volunteer || 'Jamie Chen'} · ${request.status === 'Waiting for volunteer' ? 'awaiting approval' : request.status}`}</span></div><button onClick={() => setSection('My Requests')}>{index === 0 ? 'Open' : 'Pending'}</button></div>) : <p className="sn-empty-note">No recent activity yet.</p>}</section>
            <section className="senior-box senior-check-box"><h2>Your daily check-in</h2><p>How are you feeling today?</p><span>A quick check-in helps your family stay informed.</span>{checkedToday ? <div className="senior-check-saved">✓ Check-in saved · Feeling {wellness.mood.toLowerCase()}</div> : <button onClick={() => setShowCheckIn(true)}>Daily Check-In</button>}</section></div>
        </>}
        {section === 'My Requests' && <section className="senior-box senior-request-page"><div className="senior-box-heading"><div><h2>Your assistance requests</h2><p>Create, edit, or cancel a request for help.</p></div><button onClick={() => { setEditing(null); setShowForm(true) }}>＋ Request Help</button></div>{requestList}</section>}
        {section === 'Notifications' && <section className="senior-box"><h2>Notifications</h2>{notifications.length ? notifications.map((item) => <div className="senior-notification-row" key={item.id}><strong>{item.text}</strong><span>{item.time}</span></div>) : <p className="sn-empty-note">You’re all caught up.</p>}</section>}
        {section === 'Messages' && <MessageThread messages={messages} setMessages={setMessages} role="senior" senderName={seniorProfile.fullName} partnerName="Alex Morgan" notifications={notifications} setNotifications={setNotifications} />}
        {section === 'Settings' && <SeniorSettings activeTab={settingsTab} onTabChange={setSettingsTab} profile={seniorProfile} setProfile={setSeniorProfile} />}
        {section === 'Profile' && <SeniorProfile profile={seniorProfile} onEdit={() => { setSection('Settings'); setSettingsTab('Personal Information') }} />}
      </main>
    </div>
    {showForm && <RequestForm initial={editing} onSave={saveRequest} onClose={() => { setShowForm(false); setEditing(null) }} />}
    {showCheckIn && <div className="sn-overlay"><section className="sn-modal senior-check-modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title"><button className="sn-close" onClick={() => setShowCheckIn(false)} aria-label="Close">×</button><p className="sn-eyebrow">DAILY WELLNESS</p><h2 id="checkin-title">How are you feeling today?</h2><p className="sn-muted">A quick check-in helps your family stay informed.</p><form onSubmit={completeCheckIn}><div className="sn-moods">{[['Great','☺'],['Okay','◡'],['Low','☹']].map(([label, face]) => <button type="button" className={mood === label ? 'selected' : ''} key={label} onClick={() => setMood(label)}><span>{face}</span>{label}</button>)}</div><div className="sn-modal-actions"><button type="button" className="sn-button sn-button-light" onClick={() => setShowCheckIn(false)}>Cancel</button><button className="sn-button sn-button-primary" disabled={!mood}>Save check-in</button></div></form></section></div>}
  </div>
}

function CaregiverDashboard({ requests, setRequests, volunteers, setVolunteers, notifications, setNotifications, messages, setMessages, seniorName, setSeniorName, wellness, onNotifications }) {
  const [section, setSection] = useState('Dashboard')
  const [settingsTab, setSettingsTab] = useState('Personal Information')
  const [caregiverProfile, setCaregiverProfile] = useStoredState('silvernest.caregiver.profile', initialCaregiverProfile)
  const [showLink, setShowLink] = useState(false)
  const [linkInput, setLinkInput] = useState(seniorName || '')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const pending = volunteers.filter((item) => item.status === 'Pending')
  const active = requests.filter((request) => request.status !== 'Cancelled')
  const pendingRequests = active.filter((request) => !request.status.toLowerCase().includes('assigned'))
  const navItems = [['Dashboard', '⌂'], ['My Requests', '▤'], ['Messages', '▱'], ['Notifications', '♧'], ['Profile', '◉'], ['Settings', '⚙']]
  const wellnessLabel = wellness.mood || 'Need a Call'
  const wellnessTime = wellness.time || '9:00 AM'
  const saveRequest = (form) => {
    setRequests([{ ...form, id: `r-${Date.now()}`, status: 'Waiting for volunteer', volunteer: '' }, ...requests])
    setNotifications([makeNotification(`A help request for ${seniorName || 'Margaret'} was created.`), ...notifications])
    setShowForm(false)
  }
  const decideVolunteer = (id, status) => {
    const volunteer = volunteers.find((item) => item.id === id)
    setVolunteers(volunteers.map((item) => item.id === id ? { ...item, status } : item))
    if (status === 'Approved') {
      const request = requests.find((item) => item.title === volunteer?.task && item.status !== 'Cancelled')
      if (request) setRequests(requests.map((item) => item.id === request.id ? { ...item, status: 'Volunteer assigned', volunteer: volunteer.name } : item))
    }
    setNotifications([makeNotification(`${volunteer?.name} was ${status.toLowerCase()}.`), ...notifications])
  }
  const connectSenior = (event) => {
    event.preventDefault()
    setSeniorName(linkInput.trim())
    setShowLink(false)
    setNotifications([makeNotification(`${linkInput.trim()} is now linked to your caregiver account.`), ...notifications])
  }
  const requestList = active.length ? <div className="sn-request-list">{active.map((request) => <article className="sn-request-card" key={request.id}><div className="sn-request-symbol">{request.category === 'Companionship' ? '♡' : '⌁'}</div><div className="sn-request-body"><div className="sn-request-top"><div><h3>{request.title}</h3><span className="sn-category">{request.category}</span></div><Status status={request.status} /></div><div className="sn-request-meta"><span>▣ {new Date(`${request.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span>◷ {request.time || 'Time not set'}</span>{request.volunteer && <span>♡ {request.volunteer}</span>}</div>{request.details && <p className="sn-request-details">{request.details}</p>}</div></article>)}</div> : <p className="sn-empty-note">No requests yet.</p>
  const volunteerReview = <section className="senior-box caregiver-review"><div className="senior-box-heading"><div><h2>Volunteer requests</h2><p>Review volunteers who offered to help {seniorName || 'Margaret'}.</p></div><span className="sn-count">{pending.length}</span></div>{volunteers.length ? volunteers.map((volunteer) => <article className="sn-volunteer-card" key={volunteer.id}><div className="sn-volunteer-avatar">{volunteer.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="sn-volunteer-info"><strong>{volunteer.name}</strong><span>Request: {volunteer.task}</span><small>{volunteer.date}</small></div>{volunteer.status === 'Pending' ? <div className="sn-review-actions"><button className="sn-approve" onClick={() => decideVolunteer(volunteer.id, 'Approved')}>Approve</button><button className="sn-reject" onClick={() => decideVolunteer(volunteer.id, 'Rejected')}>Reject</button></div> : <Status status={volunteer.status} />}</article>) : <p className="sn-empty-note">No volunteer requests to review.</p>}</section>
  const activityRows = active.slice(0, 1).map((request) => <div className="senior-activity-row" key={request.id}><div><strong>{request.title}</strong><span>{request.id === 'r-1' ? 'SN-1042 · ' : ''}{new Date(`${request.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Oakwood</span></div><button onClick={() => setSection('My Requests')}>Open</button></div>)
  return <div className="senior-shell caregiver-shell">
    <aside className="senior-sidebar"><Link className="senior-logo" to="/">SilverNest</Link><p className="senior-workspace">Family Caregiver workspace</p><nav className="senior-nav" aria-label="Caregiver workspace navigation">{navItems.map(([label, icon]) => <button key={label} onClick={() => { if (label === 'Notifications') onNotifications(); else { setSection(label); if (label === 'Settings') setSettingsTab('Personal Information') } }} className={section === label ? 'selected' : ''}><span>{icon}</span>{label}</button>)}</nav><Link className="senior-logout" to="/">⇥ &nbsp; Log Out</Link></aside>
    <div className="senior-work-area"><header className="senior-topbar"><label className="senior-search"><input placeholder="Search SilverNest..." aria-label="Search SilverNest" /><span>⌕</span></label><div className="senior-account"><button className="senior-bell" aria-label="Open notifications" onClick={onNotifications}>♧{notifications.length > 0 && <i />}</button><span className="senior-avatar">{(caregiverProfile.fullName || 'A').charAt(0).toUpperCase()}</span><button className="senior-profile" onClick={() => setSection('Profile')}>{caregiverProfile.fullName}⌄</button></div></header>
      <main className="senior-main">
        <div className="senior-page-title"><div><h1>{section === 'Settings' ? 'Profile and Settings' : section}</h1><p>Family Caregiver workspace · {section === 'Settings' ? settingsTab : section === 'Dashboard' ? `Caregiver — ${wellnessLabel}` : section}</p></div></div>
        {section === 'Dashboard' && <>
          <div className="senior-greeting"><h2>Good morning!</h2><p>Welcome to your SilverNest dashboard.</p></div>
          <div className="senior-stat-grid"><article><div><span className="senior-stat-number">{active.length}</span><h3>Active Requests</h3></div><p>{Math.max(active.length - pendingRequests.length, 0)} open · {pendingRequests.length} pending</p></article><article><div><span className="senior-stat-number">—</span><h3>Today’s Check-In</h3></div><p>{wellnessLabel} · {wellnessTime}</p></article><article><div><span className="senior-stat-number">{notifications.length}</span><h3>Notifications</h3></div><p>{notifications.length === 1 ? 'One unread update' : `${notifications.length} unread updates`}</p></article></div>
          <div className="senior-actions"><button onClick={() => setShowForm(true)}>Request Help</button><button onClick={() => { setToast(`Today's check-in: ${wellnessLabel} · ${wellnessTime}`); window.setTimeout(() => setToast(''), 3000) }}>Daily Check-In</button><button onClick={() => setSection('My Requests')}>View {seniorName || 'Margaret'}’s requests</button></div>
          {notifications.length > 0 && <button className="senior-alert" onClick={onNotifications}><strong>Urgent notification alert</strong><span>A wellness alert needs attention. Open Notifications to review the update.</span></button>}
          <div className="senior-lower-grid"><section className="senior-box"><div className="senior-box-heading"><h2>Recent Activity</h2><button onClick={() => setSection('My Requests')}>View My Requests</button></div>{activityRows}{pending[0] && <div className="senior-activity-row"><div><strong>Volunteer request</strong><span>{pending[0].name} · awaiting approval</span></div><button onClick={() => setSection('My Requests')}>Pending</button></div>}<button className="senior-view-requests" onClick={() => setSection('My Requests')}>View My Requests</button></section>
            <section className="senior-box caregiver-wellness"><h2>{seniorName || 'Margaret'}’s wellness</h2><strong className="caregiver-wellness-label">Selected: {wellnessLabel}</strong><p>“{wellness.mood === 'Need a Call' ? 'Could someone call me this morning?' : wellness.mood ? `${seniorName || 'Margaret'} checked in today.` : 'Could someone call me this morning?'}”</p><div><button onClick={() => { setToast(`Call ${seniorName || 'Margaret'} from your phone.`); window.setTimeout(() => setToast(''), 3000) }}>Call {seniorName || 'Margaret'}</button><button onClick={() => setSection('Messages')}>Message</button></div></section></div>
          <div className="caregiver-review-below">{volunteerReview}</div>
        </>}
        {section === 'My Requests' && <div className="caregiver-requests-grid"><section className="senior-box caregiver-request-list"><div className="senior-box-heading"><div><h2>{seniorName || 'Margaret'}’s requests</h2><p>Track assistance requests and their current status.</p></div><button onClick={() => setShowForm(true)}>＋ Request Help</button></div>{requestList}</section>{volunteerReview}</div>}
        {section === 'Messages' && <MessageThread messages={messages} setMessages={setMessages} role="caregiver" senderName={caregiverProfile.fullName} partnerName={seniorName || 'Margaret'} notifications={notifications} setNotifications={setNotifications} />}
        {section === 'Notifications' && <section className="senior-box"><h2>Notifications</h2>{notifications.length ? notifications.map((item) => <div className="senior-notification-row" key={item.id}><strong>{item.text}</strong><span>{item.time}</span></div>) : <p className="sn-empty-note">You’re all caught up.</p>}</section>}
        {section === 'Profile' && <SeniorProfile profile={{ ...caregiverProfile, emergencyContact: seniorName ? `${seniorName} · ${caregiverProfile.emergencyContact.split('·').at(-1)?.trim() || '(555) 010-2042'}` : 'No linked senior' }} roleLabel="Caregiver" description={`Caregiver account · Linked senior: ${seniorName || 'None'}`} onEdit={() => { setSection('Settings'); setSettingsTab('Personal Information') }} onManageLink={() => { setLinkInput(seniorName || ''); setShowLink(true) }} />}
        {section === 'Settings' && <SeniorSettings activeTab={settingsTab} onTabChange={setSettingsTab} profile={caregiverProfile} setProfile={setCaregiverProfile} roleLabel="Caregiver" preferenceKey="silvernest.caregiver.preferences" />}
      </main>
    </div>
    {showForm && <RequestForm onSave={saveRequest} onClose={() => setShowForm(false)} />}
    {showLink && <div className="sn-overlay"><section className="sn-modal sn-link-modal" role="dialog" aria-modal="true" aria-labelledby="link-title"><button className="sn-close" onClick={() => setShowLink(false)} aria-label="Close">×</button><span className="sn-link-illustration">♡</span><p className="sn-eyebrow">FAMILY CONNECTION</p><h2 id="link-title">Link a senior</h2><p className="sn-muted">Enter the senior’s name or invitation code to connect and follow their support.</p><form className="sn-form" onSubmit={connectSenior}><label>Senior’s name or invite code<input value={linkInput} onChange={(event) => setLinkInput(event.target.value)} placeholder="e.g. Margaret Morgan or SN-4821" required /></label><div className="sn-modal-actions"><button type="button" className="sn-button sn-button-light" onClick={() => setShowLink(false)}>Cancel</button><button className="sn-button sn-button-primary">Connect</button></div></form></section></div>}
    {toast && <div className="caregiver-toast" role="status">{toast}</div>}
  </div>
}
export default function MemberFeatures() {
  const caregiver = useLocation().pathname === '/caregiver'
  const [requests, setRequests] = useStoredState('silvernest.requests', starterRequests)
  const [messages, setMessages] = useStoredState('silvernest.messages', [])
  const [wellness, setWellness] = useStoredState('silvernest.wellness', {})
  const [volunteers, setVolunteers] = useStoredState('silvernest.volunteers.member2', starterVolunteers)
  const [seniorName, setSeniorName] = useStoredState('silvernest.linkedSenior.member2', 'Margaret Morgan')
  const [notifications, setNotifications] = useStoredState('silvernest.notifications', [{ id: 'wellness-alert', text: 'A wellness alert needs attention. Please check in with Margaret.', time: 'Just now' }])
  const [showNotifications, setShowNotifications] = useState(false)
  return <div className="sn-app">{caregiver
    ? <CaregiverDashboard requests={requests} setRequests={setRequests} volunteers={volunteers} setVolunteers={setVolunteers} notifications={notifications} setNotifications={setNotifications} messages={messages} setMessages={setMessages} seniorName={seniorName} setSeniorName={setSeniorName} wellness={wellness} onNotifications={() => setShowNotifications(!showNotifications)} />
    : <SeniorDashboard requests={requests} setRequests={setRequests} wellness={wellness} setWellness={setWellness} notifications={notifications} setNotifications={setNotifications} messages={messages} setMessages={setMessages} onNotifications={() => setShowNotifications(!showNotifications)} />}
    {showNotifications && <Notifications items={notifications} onClose={() => setShowNotifications(false)} onClear={() => setNotifications([])} />}
  </div>
}
