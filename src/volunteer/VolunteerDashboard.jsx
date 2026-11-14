import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../MemberFeatures.css';
import './Volunteer.css';
import {
  TASK_STATUS,
  volunteer,
  serviceCategories,
  initialTasks,
  initialFeedback,
} from './volunteerData';
import FindTasks from './FindTasks';
import MyTasks from './MyTasks';
import ServiceHours from './ServiceHours';

const defaultSafetyAlerts = [
  {
    id: 'ALERT-01',
    severity: 'high',
    title: 'Non-Medical Assistance Policy',
    message:
      'Volunteers must only perform non-medical errands, light chores, and companionship. Never administer medication or lift heavy objects.',
    dismissed: false,
  },
  {
    id: 'ALERT-02',
    severity: 'medium',
    title: 'Verify Senior Identity Upon Arrival',
    message:
      'Confirm the senior’s name and task details at the doorstep and report any safety concerns immediately.',
    dismissed: false,
  },
];

const defaultNotifications = [
  {
    id: 'NOTIF-01',
    type: 'assignment',
    taskId: 'TASK-006',
    targetTab: 'mytasks',
    message: 'Assigned task: "Help with light kitchen chores" for Mariam Saleh.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'NOTIF-02',
    type: 'available',
    taskId: 'TASK-001',
    targetTab: 'find',
    message: 'New request in Al Doha: "Pick up weekly groceries" (1.2 km away).',
    time: '4 hours ago',
    read: false,
  },
];

function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [volunteerProfile, setVolunteerProfile] = useState({
    ...volunteer,
    phone: '050 123 4567',
    emergencyContact: 'Sara Ahmed · 055 987 6543',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
const [profileBackup, setProfileBackup] = useState(null);
  // Shared tasks & feedback state
  const [tasks, setTasks] = useState(initialTasks);
  const [feedback] = useState(initialFeedback);

  // Safety alerts & notifications
  const [safetyAlerts, setSafetyAlerts] = useState(defaultSafetyAlerts);
  const [notifications, setNotifications] = useState(defaultNotifications);

  // Highlighted task when navigating from a notification
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isApproved = volunteerProfile.approvalStatus === 'Approved';

  // Derived task lists matching TASK_STATUS in volunteerData.js
  const availableTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.AVAILABLE
  );
  const requestedTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.REQUESTED
  );
  const assignedTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.ASSIGNED
  );
  const inProgressTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.IN_PROGRESS
  );
  const awaitingReviewTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.AWAITING_REVIEW
  );
  const completedTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.COMPLETED
  );

  const myAllTasks = tasks.filter((t) => t.volunteerId === volunteerProfile.id);

  const totalApprovedHours = completedTasks.reduce(
    (sum, t) => sum + (t.approvedHours || t.estimatedHours || 0),
    0
  );

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Claim an available task (with approval & schedule conflict check)
  const handleClaimTask = (taskId) => {
    if (!isApproved) {
      showToast('Your volunteer profile must be approved before claiming tasks.');
      return;
    }

    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const hasConflict = myAllTasks.some(
      (t) =>
        (t.status === TASK_STATUS.REQUESTED ||
          t.status === TASK_STATUS.ASSIGNED ||
          t.status === TASK_STATUS.IN_PROGRESS) &&
        t.date === targetTask.date &&
        t.startTime === targetTask.startTime
    );

    if (hasConflict) {
      showToast(
        `Schedule conflict: You already have a task scheduled on ${targetTask.date} at ${targetTask.startTime}.`
      );
      return;
    }

    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: TASK_STATUS.ASSIGNED,
              volunteerId: volunteerProfile.id,
              seniorName: t.seniorName || 'Mariam Saleh',
              assignedAt: nowIso,
            }
          : t
      )
    );

    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        type: 'assignment',
        taskId: targetTask.id,
        targetTab: 'mytasks',
        message: `You claimed "${targetTask.title}" in ${targetTask.area}.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
    showToast(`Task "${targetTask.title}" claimed and added to My Tasks!`);
  };

  // Start an assigned task
  const handleStartTask = (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: TASK_STATUS.IN_PROGRESS,
              startedAt: new Date().toISOString(),
            }
          : t
      )
    );
    if (targetTask) {
      showToast(`Started "${targetTask.title}". Status updated to In Progress.`);
    }
  };

  // Complete an in-progress task with notes and photo proof
  const handleCompleteTask = (taskId, completionNotes, proofFileName) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: TASK_STATUS.AWAITING_REVIEW,
              completionNotes,
              proofFile: proofFileName,
              completedAt: new Date().toISOString(),
            }
          : t
      )
    );

    if (targetTask) {
      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          type: 'completion',
          taskId: targetTask.id,
          targetTab: 'hours',
          message: `"${targetTask.title}" submitted for review. Service hours pending approval.`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      showToast(`"${targetTask.title}" submitted for review!`);
    }
  };

  // Acknowledge individual safety alert
  const handleDismissAlert = (alertId) => {
    setSafetyAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
    );
  };

  // Navigate to task on notification click
  const handleNotificationClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setActiveTab(notif.targetTab);
    setHighlightedTaskId(notif.taskId);
    setShowNotifPanel(false);
    setTimeout(() => setHighlightedTaskId(null), 4000);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeSafetyAlerts = safetyAlerts.filter((a) => !a.dismissed);
  const activeCount =
    requestedTasks.length + assignedTasks.length + inProgressTasks.length;

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: '⌂' },
  { id: 'find', label: `Find Tasks (${availableTasks.length})`, icon: '⌕' },
  { id: 'mytasks', label: `My Tasks (${activeCount})`, icon: '▤' },
  { id: 'hours', label: 'Service Hours', icon: '◷' },
  { id: 'notifications', label: 'Notifications', icon: '♧' },
  { id: 'profile', label: 'Profile', icon: '◯' },
];
const tabTitles = {
  overview: 'Dashboard',
  find: 'Find Tasks',
  mytasks: 'My Tasks',
  hours: 'Service Hours',
  notifications: 'Notifications',
  profile: 'Profile',
};

  const handleQuickSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && activeTab === 'overview') {
      setActiveTab('find');
    }
  };

  return (
    <div className="sn-app">
      <div className="senior-shell volunteer-shell">
        {/* Left Sidebar matching Senior/Caregiver workspace */}
        <aside className="senior-sidebar">
          <Link className="senior-logo" to="/">
            SilverNest
          </Link>
          <p className="senior-workspace">Volunteer workspace</p>

          <nav
            className="senior-nav"
            aria-label="Volunteer workspace navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'selected' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <Link className="senior-logout" to="/">
            ⇥ &nbsp; Log Out
          </Link>
        </aside>

        {/* Main Workspace Area */}
        <div className="senior-work-area">
          <header className="senior-topbar">
            <label className="senior-search">
              <input
                type="text"
                placeholder="Search SilverNest tasks..."
                aria-label="Search SilverNest tasks"
                value={searchQuery}
                onChange={handleQuickSearch}
              />
              <span>⌕</span>
            </label>

            <div className="senior-account">
              <button
                type="button"
                className="senior-bell"
                aria-label="Open notifications"
                onClick={() => setShowNotifPanel(!showNotifPanel)}
              >
                ♧
                {unreadNotifCount > 0 && <i />}
              </button>
              <span className="senior-avatar">
                {volunteerProfile.name.charAt(0).toUpperCase()}
              </span>
              <button
                type="button"
                className="senior-profile"
                onClick={() => setActiveTab('profile')}
              >
                {volunteerProfile.name} ⌄
              </button>
            </div>
          </header>

          {/* Notification Dropdown Panel */}
          {showNotifPanel && (
            <div className="sn-notice-panel">
              <div className="sn-notice-head">
                <strong>Notifications ({unreadNotifCount} unread)</strong>
                <button
                  type="button"
                  onClick={() => setShowNotifPanel(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>
              {notifications.length > 0 ? (
                <>
                  <div className="sn-notice-list">
                    {notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`sn-notice vol-notice-clickable ${
                          notif.read ? 'read' : 'unread'
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span className="sn-notice-icon">✦</span>
                        <div>
                          <p>{notif.message}</p>
                          <small>{notif.time} · Click to view</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="sn-text-button"
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                </>
              ) : (
                <p className="sn-empty-note">You’re all caught up.</p>
              )}
            </div>
          )}

          <main className="senior-main">
            {/* Page Title Header */}
            <div className="senior-page-title">
              <div>
                <h1>{tabTitles[activeTab]}</h1>
                <p>
                  Volunteer workspace ·{' '}
                  {isApproved
                    ? '✓ Vetted & Approved Volunteer'
                    : 'Pending Admin Approval'}{' '}
                  · {volunteerProfile.neighborhood}, {volunteerProfile.city}
                </p>
              </div>
            </div>

            {toastMessage && (
              <div className="caregiver-toast" role="status">
                {toastMessage}
              </div>
            )}

            {/* DASHBOARD OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="senior-greeting">
                  <h2>Good morning, {volunteerProfile.name.split(' ')[0]}!</h2>
                  <p>Welcome to your SilverNest volunteer dashboard.</p>
                </div>

                {/* 3 Stat Cards matching Senior/Caregiver layout */}
                <div className="senior-stat-grid">
                  <article>
                    <div>
                      <span className="senior-stat-number">{activeCount}</span>
                      <h3>Active Tasks</h3>
                    </div>
                    <p>
                      {assignedTasks.length} assigned · {inProgressTasks.length}{' '}
                      in progress · {requestedTasks.length} requested
                    </p>
                  </article>

                  <article>
                    <div>
                      <span className="senior-stat-number">
                        {totalApprovedHours}h
                      </span>
                      <h3>Approved Hours</h3>
                    </div>
                    <p>
                      Goal: {volunteerProfile.serviceHoursGoal}h ·{' '}
                      {completedTasks.length} approved tasks
                    </p>
                  </article>

                  <article>
                    <div>
                      <span className="senior-stat-number">
                        {availableTasks.length}
                      </span>
                      <h3>Open Requests</h3>
                    </div>
                    <p>Available in {volunteerProfile.city}</p>
                  </article>
                </div>

                {/* Quick Action Buttons */}
                <div className="senior-actions">
                  <button type="button" onClick={() => setActiveTab('find')}>
                    Browse Available Tasks
                  </button>
                  <button type="button" onClick={() => setActiveTab('mytasks')}>
                    Open My Tasks
                  </button>
                </div>

                {/* Safety Alerts (RU9) */}
                {activeSafetyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`senior-alert vol-safety-alert ${alert.severity}`}
                  >
                    <div className="vol-alert-row">
                      <div>
                        <strong>⚠ Safety Alert: {alert.title}</strong>
                        <span>{alert.message}</span>
                      </div>
                      <button
                        type="button"
                        className="sn-button sn-button-light"
                        onClick={() => handleDismissAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}

                {/* Lower Two-Column Boxes */}
                <div className="senior-lower-grid">
                  <section className="senior-box">
                    <div className="senior-box-heading">
                      <h2>Upcoming & Active Tasks</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('mytasks')}
                      >
                        View All My Tasks
                      </button>
                    </div>

                    {[...inProgressTasks, ...assignedTasks, ...requestedTasks]
                      .length > 0 ? (
                      [...inProgressTasks, ...assignedTasks, ...requestedTasks]
                        .slice(0, 3)
                        .map((task) => (
                          <div className="senior-activity-row" key={task.id}>
                            <div>
                              <strong>{task.title}</strong>
                              <span>
                                {task.seniorName || task.area} · {task.date} (
                                {task.startTime}–{task.endTime}) · {task.status}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('mytasks')}
                            >
                              {task.status === TASK_STATUS.IN_PROGRESS
                                ? 'Complete'
                                : 'Open'}
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="sn-empty-note">
                        No active tasks right now. Browse available requests to
                        claim one.
                      </p>
                    )}
                  </section>

                  <section className="senior-box">
                    <div className="senior-box-heading">
                      <h2>Recent Notifications</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('notifications')}
                      >
                        See All
                      </button>
                    </div>

                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className="senior-activity-row vol-notif-row"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div>
                          <strong>{notif.message}</strong>
                          <span>{notif.time}</span>
                        </div>
                        <button type="button">View</button>
                      </div>
                    ))}
                  </section>
                </div>
              </>
            )}

            {/* FIND TASKS TAB */}
            {activeTab === 'find' && (
              <section className="senior-box">
                <FindTasks
                  tasks={availableTasks}
                  availableTasks={availableTasks}
                  categories={serviceCategories}
                  onClaimTask={handleClaimTask}
                  highlightedTaskId={highlightedTaskId}
                  isApproved={isApproved}
                  externalSearch={searchQuery}
                />
              </section>
            )}

            {/* MY TASKS TAB */}
            {activeTab === 'mytasks' && (
              <section className="senior-box">
                <MyTasks
                  tasks={myAllTasks}
                  requestedTasks={requestedTasks}
                  assignedTasks={assignedTasks}
                  inProgressTasks={inProgressTasks}
                  awaitingReviewTasks={awaitingReviewTasks}
                  completedTasks={completedTasks}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                  highlightedTaskId={highlightedTaskId}
                />
              </section>
            )}

            {/* SERVICE HOURS TAB */}
            {activeTab === 'hours' && (
              <section className="senior-box">
                <ServiceHours
                  tasks={myAllTasks}
                  completedTasks={[...completedTasks, ...awaitingReviewTasks]}
                  feedback={feedback}
                  volunteer={volunteerProfile}
                  volunteerProfile={volunteerProfile}

                />
              </section>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <section className="senior-box">
                <div className="senior-box-heading">
                  <h2>Notifications ({unreadNotifCount} unread)</h2>
                  {unreadNotifCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`senior-notification-row vol-notif-row ${
                        !notif.read ? 'unread' : ''
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <strong>{notif.message}</strong>
                      <span>{notif.time} · Open task →</span>
                    </div>
                  ))
                ) : (
                  <p className="sn-empty-note">You’re all caught up.</p>
                )}
              </section>
            )}
        

{/* PROFILE TAB */}
{activeTab === 'profile' && (
  <section className="senior-box senior-profile-view">
    <div className="senior-profile-summary">
      <span className="settings-avatar">
        {volunteerProfile.name.charAt(0).toUpperCase()}
      </span>
      <div>
        <h2>{volunteerProfile.name}</h2>
        <span>
          Volunteer account · {volunteerProfile.neighborhood}, {volunteerProfile.city}
        </span>
      </div>
      <span className="settings-role">Volunteer</span>
    </div>

    {!isEditingProfile ? (
      <>
        <h3>Contact information</h3>
        <dl className="senior-profile-details">
          <div>
            <dt>Phone number</dt>
            <dd>{volunteerProfile.phone}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{volunteerProfile.email}</dd>
          </div>
          <div>
            <dt>Emergency contact</dt>
            <dd>{volunteerProfile.emergencyContact}</dd>
          </div>
        </dl>

        <div className="senior-profile-actions">
          <button
            type="button"
            className="senior-profile-edit"
            onClick={() => {
  setProfileBackup({ ...volunteerProfile });
  setIsEditingProfile(true);
}}
          >
            Edit personal information
          </button>
        </div>
      </>
    ) : (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setProfileBackup(null);
          setIsEditingProfile(false);
          showToast('Personal information updated.');
        }}
      >
        <h3>Edit personal information</h3>
        <div className="settings-field-grid">
          <label className="settings-field">
            <strong>Full name</strong>
            <input
              type="text"
              value={volunteerProfile.name}
              onChange={(e) =>
                setVolunteerProfile({ ...volunteerProfile, name: e.target.value })
              }
              required
            />
          </label>
          <label className="settings-field">
            <strong>Phone number</strong>
            <input
              type="tel"
              value={volunteerProfile.phone}
              onChange={(e) =>
                setVolunteerProfile({ ...volunteerProfile, phone: e.target.value })
              }
              required
            />
          </label>
          <label className="settings-field">
            <strong>Email address</strong>
            <input
              type="email"
              value={volunteerProfile.email}
              onChange={(e) =>
                setVolunteerProfile({ ...volunteerProfile, email: e.target.value })
              }
              required
            />
          </label>
          <label className="settings-field">
            <strong>Emergency contact</strong>
            <input
              type="text"
              value={volunteerProfile.emergencyContact}
              onChange={(e) =>
                setVolunteerProfile({
                  ...volunteerProfile,
                  emergencyContact: e.target.value,
                })
              }
              required
            />
          </label>
        </div>
        <div className="settings-actions">
          <button type="submit" className="settings-save">
            Save Changes
          </button>
          <button
            type="button"
            className="settings-cancel"
            onClick={() => {
  if (profileBackup) {
    setVolunteerProfile(profileBackup);
  }

  setProfileBackup(null);
  setIsEditingProfile(false);
}}
          >
            Cancel
          </button>
        </div>
      </form>
    )}
  </section>
)}
          </main>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;